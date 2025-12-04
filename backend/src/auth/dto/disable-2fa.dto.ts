import { IsString, IsNotEmpty } from 'class-validator';

export class Disable2FADto {
    @IsString()
    @IsNotEmpty()
    password: string; // Require password to disable 2FA

    @IsString()
    @IsNotEmpty()
    token: string; // Require valid 2FA token to disable
}
