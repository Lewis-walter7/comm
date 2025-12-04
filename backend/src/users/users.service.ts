import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                bio: true,
                phone: true,
                location: true,
                avatarUrl: true,
                createdAt: true,
                hasCompletedOnboarding: true,
                deletedAt: true,
                scheduledDeletionAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                email: true,
                name: true,
                bio: true,
                phone: true,
                location: true,
                avatarUrl: true,
                hasCompletedOnboarding: true,
                deletedAt: true,
                scheduledDeletionAt: true,
            },
        });
    }

    async getUserStats(userId: string) {
        const [projectsCount, documentsCount, teamMembersCount] = await Promise.all([
            this.prisma.project.count({
                where: { ownerId: userId },
            }),
            this.prisma.document.count({
                where: { createdById: userId },
            }),
            this.prisma.projectMember.count({
                where: {
                    project: {
                        ownerId: userId,
                    },
                },
            }),
        ]);

        return {
            projects: projectsCount,
            documents: documentsCount,
            teamMembers: teamMembersCount,
        };
    }

    async getRecentActivity(userId: string, limit: number = 10) {
        const activities = await this.prisma.activity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                type: true,
                description: true,
                metadata: true,
                createdAt: true,
            },
        });

        return activities;
    }

    async search(query: string) {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 10,
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
            },
        });
    }

    async scheduleAccountDeletion(userId: string, reason?: string) {
        const deletedAt = new Date();
        const scheduledDeletionAt = new Date();
        scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30);

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt,
                scheduledDeletionAt,
            },
            select: {
                id: true,
                email: true,
                name: true,
                deletedAt: true,
                scheduledDeletionAt: true,
            },
        });

        // Log activity
        await this.prisma.activity.create({
            data: {
                userId,
                type: 'USER_LOGOUT',
                description: `Account deletion scheduled for ${scheduledDeletionAt.toLocaleDateString()}${reason ? `. Reason: ${reason}` : ''}`,
                metadata: {
                    reason,
                    scheduledDeletionAt: scheduledDeletionAt.toISOString(),
                },
            },
        });

        return user;
    }

    async cancelAccountDeletion(userId: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: null,
                scheduledDeletionAt: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                deletedAt: true,
                scheduledDeletionAt: true,
            },
        });

        // Log activity
        await this.prisma.activity.create({
            data: {
                userId,
                type: 'USER_LOGIN',
                description: 'Account deletion cancelled',
            },
        });

        return user;
    }

    async completeOnboarding(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                hasCompletedOnboarding: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                hasCompletedOnboarding: true,
            },
        });
    }

    async processScheduledDeletions() {
        const now = new Date();

        // Find users scheduled for deletion
        const usersToDelete = await this.prisma.user.findMany({
            where: {
                scheduledDeletionAt: {
                    lte: now,
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        // Delete each user (will cascade delete related data)
        for (const user of usersToDelete) {
            await this.prisma.user.delete({
                where: { id: user.id },
            });

            console.log(`Permanently deleted user: ${user.email} (${user.id})`);
        }

        return {
            deletedCount: usersToDelete.length,
            deletedUsers: usersToDelete,
        };
    }
}
