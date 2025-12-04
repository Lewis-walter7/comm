import { IsString, IsNotEmpty } from 'class-validator';

export class Enable2FADto {
    @IsString()
    @IsNotEmpty()
    password: string; // Require password to enable 2FA
}
