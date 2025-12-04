import { IsString, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class CreateProjectDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsString()
    @IsOptional()
    workspaceId?: string;
}

export class UpdateProjectDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;
}

export class AddMemberDto {
    @IsString()
    userId: string;

    @IsEnum(ProjectRole)
    @IsOptional()
    role?: ProjectRole;
}

export class UpdateMemberRoleDto {
    @IsEnum(ProjectRole)
    role: ProjectRole;
}
