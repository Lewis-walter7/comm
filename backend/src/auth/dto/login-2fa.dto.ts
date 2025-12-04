import { IsString, IsNotEmpty } from 'class-validator';

export class Login2FADto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    token: string; // 6-digit TOTP code or recovery code
}
