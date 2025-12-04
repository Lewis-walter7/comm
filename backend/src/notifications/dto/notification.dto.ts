import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsOptional()
    link?: string;

    @IsOptional()
    metadata?: any; // JSON metadata
}

export class UpdateNotificationPreferencesDto {
    @IsBoolean()
    @IsOptional()
    projectInvites?: boolean;

    @IsBoolean()
    @IsOptional()
    mentions?: boolean;

    @IsBoolean()
    @IsOptional()
    documentUpdates?: boolean;

    @IsBoolean()
    @IsOptional()
    chatMessages?: boolean;

    @IsBoolean()
    @IsOptional()
    memberActivity?: boolean;
}
