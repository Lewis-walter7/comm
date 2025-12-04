import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ActivityType } from '@prisma/client';

export class LogActivityDto {
    @IsString()
    userId: string;

    @IsEnum(ActivityType)
    type: ActivityType;

    @IsString()
    description: string;

    @IsString()
    @IsOptional()
    projectId?: string;

    @IsString()
    @IsOptional()
    documentId?: string;

    @IsOptional()
    metadata?: any;
}

export class AnalyticsQueryDto {
    @IsString()
    @IsOptional()
    startDate?: string;

    @IsString()
    @IsOptional()
    endDate?: string;

    @IsString()
    @IsOptional()
    period?: 'day' | 'week' | 'month';
}
