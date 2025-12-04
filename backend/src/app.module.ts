import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { AccountCleanupService } from './jobs/account-cleanup.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        ScheduleModule.forRoot(),
        DatabaseModule,
        AuthModule,
        ProjectsModule,
        DocumentsModule,
        ChatModule,
        UsersModule,
        NotificationsModule,
        AnalyticsModule,
        WorkspacesModule,
    ],
    providers: [AccountCleanupService],
})
export class AppModule { }

