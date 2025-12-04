import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ScheduleDeletionDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
