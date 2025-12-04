import { Controller, Get, Post, Put, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    create(@CurrentUser() user: any, @Body() createDocumentDto: CreateDocumentDto) {
        return this.documentsService.create(user.id, createDocumentDto);
    }

    @Get()
    @Get()
    findAll(@CurrentUser() user: any, @Query('projectId') projectId?: string) {
        return this.documentsService.findAll(user.id, projectId);
    }

    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.documentsService.findOne(user.id, id);
    }

    @Put(':id/content')
    saveContent(
        @Param('id') id: string,
        @Body('encryptedContent') encryptedContent: string,
    ) {
        return this.documentsService.saveContent(id, encryptedContent);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() updateDocumentDto: UpdateDocumentDto,
    ) {
        return this.documentsService.update(user.id, id, updateDocumentDto);
    }

    @Delete(':id')
    remove(@CurrentUser() user: any, @Param('id') id: string) {
        return this.documentsService.remove(user.id, id);
    }
}
