import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferencesDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
    user: {
        id: string;
    };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(
        @Req() req: AuthRequest,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.notificationsService.getNotifications(
            req.user.id,
            limit ? parseInt(limit) : 20,
            offset ? parseInt(offset) : 0,
        );
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: AuthRequest) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { count };
    }

    @Put(':id/read')
    @HttpCode(HttpStatus.OK)
    async markAsRead(@Req() req: AuthRequest, @Param('id') id: string) {
        await this.notificationsService.markAsRead(id, req.user.id);
        return { success: true };
    }

    @Put('mark-all-read')
    @HttpCode(HttpStatus.OK)
    async markAllAsRead(@Req() req: AuthRequest) {
        await this.notificationsService.markAllAsRead(req.user.id);
        return { success: true };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteNotification(@Req() req: AuthRequest, @Param('id') id: string) {
        await this.notificationsService.deleteNotification(id, req.user.id);
        return { success: true };
    }

    // Preferences
    @Get('preferences')
    async getPreferences(@Req() req: AuthRequest) {
        return this.notificationsService.getPreferences(req.user.id);
    }

    @Put('preferences')
    @HttpCode(HttpStatus.OK)
    async updatePreferences(@Req() req: AuthRequest, @Body() dto: UpdateNotificationPreferencesDto) {
        return this.notificationsService.updatePreferences(req.user.id, dto);
    }
}
