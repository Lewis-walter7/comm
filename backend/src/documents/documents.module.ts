import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsGateway } from './documents.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [JwtModule],
    controllers: [DocumentsController],
    providers: [DocumentsService, DocumentsGateway],
    exports: [DocumentsService],
})
export class DocumentsModule { }
