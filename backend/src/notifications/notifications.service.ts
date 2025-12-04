import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNotificationDto, UpdateNotificationPreferencesDto } from './dto/notification.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async createNotification(dto: CreateNotificationDto) {
        // Check user preferences before creating notification
        const preferences = await this.getPreferences(dto.userId);

        if (!this.shouldSendNotification(dto.type, preferences)) {
            return null; // User has disabled this notification type
        }

        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                link: dto.link,
                metadata: dto.metadata,
            },
        });

        return notification;
    }

    async getNotifications(userId: string, limit = 20, offset = 0) {
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        return { notifications, total };
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId, // Ensure user owns this notification
            },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: { read: true },
        });
    }

    async deleteNotification(notificationId: string, userId: string) {
        return this.prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId, // Ensure user owns this notification
            },
        });
    }

    // Notification Preferences
    async getPreferences(userId: string) {
        let preferences = await this.prisma.notificationPreferences.findUnique({
            where: { userId },
        });

        // Create default preferences if they don't exist
        if (!preferences) {
            preferences = await this.prisma.notificationPreferences.create({
                data: { userId },
            });
        }

        return preferences;
    }

    async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
        // Ensure preferences exist
        await this.getPreferences(userId);

        return this.prisma.notificationPreferences.update({
            where: { userId },
            data: dto,
        });
    }

    // Helper method to check if notification should be sent based on preferences
    private shouldSendNotification(type: NotificationType, preferences: any): boolean {
        switch (type) {
            case 'WORKSPACE_INVITE':
            case 'WORKSPACE_JOIN_REQUEST':
                return preferences.workspaceInvites;
            case 'PROJECT_INVITE':
                return preferences.projectInvites;
            case 'MENTION':
                return preferences.mentions;
            case 'DOCUMENT_UPDATE':
                return preferences.documentUpdates;
            case 'CHAT_MESSAGE':
                return preferences.chatMessages;
            case 'MEMBER_JOINED':
            case 'MEMBER_LEFT':
                return preferences.memberActivity;
            default:
                return true;
        }
    }
}
