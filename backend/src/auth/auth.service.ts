import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Login2FADto } from './dto/login-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityType } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto, ipAddress: string, deviceInfo: string): Promise<AuthResponseDto> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
            },
        });

        // Note: Workspace will be created during onboarding flow
        // This prevents duplicate workspace creation

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Create session
        await this.createSession(user.id, deviceInfo, ipAddress);

        // Log activity
        await this.prisma.activity.create({
            data: {
                userId: user.id,
                type: ActivityType.USER_LOGIN,
                description: 'User registered and logged in',
                metadata: { ipAddress, deviceInfo },
            },
        });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
            },
        };
    }

    async login(dto: LoginDto, ipAddress: string, deviceInfo: string): Promise<AuthResponseDto | { requiresTwoFactor: boolean; email: string }> {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            return {
                requiresTwoFactor: true,
                email: user.email,
            };
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Create session
        await this.createSession(user.id, deviceInfo, ipAddress);

        // Log activity
        await this.prisma.activity.create({
            data: {
                userId: user.id,
                type: ActivityType.USER_LOGIN,
                description: 'User logged in',
                metadata: { ipAddress, deviceInfo },
            },
        });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
            },
        };
    }

    async loginWith2FA(dto: Login2FADto, ipAddress: string, deviceInfo: string): Promise<AuthResponseDto> {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify 2FA token or recovery code
        const isValidToken = this.verify2FAToken(user.twoFactorSecret!, dto.token);
        const isValidRecoveryCode = await this.verifyRecoveryCode(user.id, dto.token);

        if (!isValidToken && !isValidRecoveryCode) {
            throw new UnauthorizedException('Invalid 2FA token or recovery code');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Create session
        await this.createSession(user.id, deviceInfo, ipAddress);

        // Log activity
        await this.prisma.activity.create({
            data: {
                userId: user.id,
                type: ActivityType.USER_LOGIN,
                description: 'User logged in with 2FA',
                metadata: { ipAddress, deviceInfo },
            },
        });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
            },
        };
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.secret'),
            });

            const accessToken = this.jwtService.sign(
                { sub: payload.sub, email: payload.email },
                {
                    secret: this.configService.get('jwt.secret'),
                    expiresIn: this.configService.get('jwt.expiresIn'),
                },
            );

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn'),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    // ==================== 2FA Methods ====================

    async enable2FA(userId: string, dto: Enable2FADto): Promise<{ secret: string; qrCodeUrl: string; recoveryCodes: string[] }> {
        // Find user and verify password
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        if (user.twoFactorEnabled) {
            throw new BadRequestException('Two-factor authentication is already enabled');
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `SecureRealTime (${user.email})`,
            issuer: 'SecureRealTime',
        });

        // Return the otpauth_url directly for the QR code component to render
        // The QRCodeSVG component on the frontend will generate the QR code from this URL

        // Generate recovery codes (10 codes)
        const recoveryCodes = await this.generateRecoveryCodes();

        // Store encrypted secret and hashed recovery codes (not enabled yet)
        // Secret will be stored after verification
        return {
            secret: secret.base32!,
            qrCodeUrl: secret.otpauth_url!,
            recoveryCodes,
        };
    }

    async verify2FASetup(userId: string, dto: Verify2FADto, secret: string): Promise<{ success: boolean; recoveryCodes: string[] }> {
        const isValid = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: dto.token,
            window: 2, // Allow 2 time steps before/after
        });

        if (!isValid) {
            throw new BadRequestException('Invalid verification code');
        }

        // Generate and hash recovery codes
        const recoveryCodes = await this.generateRecoveryCodes();
        const hashedRecoveryCodes = await Promise.all(
            recoveryCodes.map(code => bcrypt.hash(code, 10))
        );

        // Enable 2FA and store secret
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: secret, // In production, encrypt this
                recoveryCodes: hashedRecoveryCodes,
            },
        });

        return {
            success: true,
            recoveryCodes,
        };
    }

    async disable2FA(userId: string, dto: Disable2FADto): Promise<{ success: boolean }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.twoFactorEnabled) {
            throw new BadRequestException('Two-factor authentication is not enabled');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        // Verify 2FA token
        const isValidToken = this.verify2FAToken(user.twoFactorSecret!, dto.token);
        if (!isValidToken) {
            throw new BadRequestException('Invalid 2FA token');
        }

        // Disable 2FA
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                recoveryCodes: [],
            },
        });

        return { success: true };
    }

    async regenerateRecoveryCodes(userId: string): Promise<{ recoveryCodes: string[] }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.twoFactorEnabled) {
            throw new BadRequestException('Two-factor authentication is not enabled');
        }

        // Generate new recovery codes
        const recoveryCodes = await this.generateRecoveryCodes();
        const hashedRecoveryCodes = await Promise.all(
            recoveryCodes.map(code => bcrypt.hash(code, 10))
        );

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                recoveryCodes: hashedRecoveryCodes,
            },
        });

        return { recoveryCodes };
    }

    private verify2FAToken(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2,
        });
    }

    private async verifyRecoveryCode(userId: string, code: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.recoveryCodes || user.recoveryCodes.length === 0) {
            return false;
        }

        // Check if code matches any hashed recovery code
        for (let i = 0; i < user.recoveryCodes.length; i++) {
            const isMatch = await bcrypt.compare(code, user.recoveryCodes[i]);
            if (isMatch) {
                // Remove used recovery code
                const updatedCodes = user.recoveryCodes.filter((_, index) => index !== i);
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { recoveryCodes: updatedCodes },
                });
                return true;
            }
        }

        return false;
    }

    private async generateRecoveryCodes(): Promise<string[]> {
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
            // Generate 8-character alphanumeric code
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push(code);
        }
        return codes;
    }

    // ==================== Session & Password Methods ====================

    async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ success: boolean }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid current password');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true };
    }

    async createSession(userId: string, deviceInfo: string, ipAddress: string): Promise<void> {
        // Optional: Limit number of active sessions per user (e.g., 10)
        const sessionCount = await this.prisma.session.count({
            where: { userId },
        });

        if (sessionCount >= 10) {
            // Delete oldest session
            const oldestSession = await this.prisma.session.findFirst({
                where: { userId },
                orderBy: { lastActive: 'asc' },
            });

            if (oldestSession) {
                await this.prisma.session.delete({
                    where: { id: oldestSession.id },
                });
            }
        }

        // Get location from IP (mock implementation for now)
        // In a real app, use a service like maxmind or ipstack
        const location = 'Unknown Location';

        await this.prisma.session.create({
            data: {
                userId,
                deviceInfo,
                ipAddress,
                location,
            },
        });
    }

    async getSessions(userId: string) {
        return this.prisma.session.findMany({
            where: { userId },
            orderBy: { lastActive: 'desc' },
        });
    }

    async revokeSession(userId: string, sessionId: string): Promise<{ success: boolean }> {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session || session.userId !== userId) {
            throw new UnauthorizedException('Session not found or access denied');
        }

        await this.prisma.session.delete({
            where: { id: sessionId },
        });

        return { success: true };
    }

    async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<{ success: boolean }> {
        await this.prisma.session.deleteMany({
            where: {
                userId,
                id: { not: currentSessionId },
            },
        });

        return { success: true };
    }
}
