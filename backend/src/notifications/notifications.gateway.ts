import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    constructor(private notificationsService: NotificationsService) { }

    handleConnection(client: Socket) {
        const userId = client.handshake.auth.userId || client.handshake.query.userId;

        if (userId) {
            this.userSockets.set(userId as string, client.id);
            client.join(`user:${userId}`);
            console.log(`User ${userId} connected with socket ${client.id}`);
        }
    }

    handleDisconnect(client: Socket) {
        // Remove user from socket map
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    }

    // Method to emit notification to a specific user
    async emitNotification(dto: CreateNotificationDto) {
        // Create notification in database
        const notification = await this.notificationsService.createNotification(dto);

        if (!notification) {
            return; // User has disabled this notification type
        }

        // Emit to user's room
        this.server.to(`user:${dto.userId}`).emit('notification:new', notification);

        // Also emit unread count update
        const unreadCount = await this.notificationsService.getUnreadCount(dto.userId);
        this.server.to(`user:${dto.userId}`).emit('notification:unread-count', { count: unreadCount });

        return notification;
    }

    @SubscribeMessage('notification:mark-read')
    async handleMarkAsRead(client: Socket, notificationId: string) {
        const userId = client.handshake.auth.userId || client.handshake.query.userId;

        if (userId) {
            await this.notificationsService.markAsRead(notificationId, userId as string);

            // Emit updated unread count
            const unreadCount = await this.notificationsService.getUnreadCount(userId as string);
            client.emit('notification:unread-count', { count: unreadCount });
        }
    }

    @SubscribeMessage('notification:mark-all-read')
    async handleMarkAllAsRead(client: Socket) {
        const userId = client.handshake.auth.userId || client.handshake.query.userId;

        if (userId) {
            await this.notificationsService.markAllAsRead(userId as string);
            client.emit('notification:unread-count', { count: 0 });
        }
    }
}
