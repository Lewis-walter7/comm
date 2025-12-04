import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    title: string;

    @IsString()
    @IsNotEmpty()
    projectId: string;
}

export class UpdateDocumentDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    title: string;
}
