import { IsString, IsOptional, MinLength, MaxLength, IsEmail, IsUrl } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    phone?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    location?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
    avatarUrl?: string;
}

export interface UserResponseDto {
    id: string;
    email: string;
    name: string;
    bio?: string;
    phone?: string;
    location?: string;
    avatarUrl?: string;
    createdAt: Date;
    hasCompletedOnboarding: boolean;
    deletedAt?: Date;
    scheduledDeletionAt?: Date;
}
