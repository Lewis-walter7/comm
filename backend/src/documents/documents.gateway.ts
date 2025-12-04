import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { DocumentsService } from "./documents.service";
import { PrismaService } from "../database/prisma.service";

@WebSocketGateway({
  cors: {
    origin: "*", // Configure this properly in production
  },
  namespace: "documents",
})
export class DocumentsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private documentsService: DocumentsService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("jwt.secret"),
      });

      // Attach user to socket
      client.data.user = payload;

      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      console.error("Connection unauthorized", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join")
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const { documentId } = data;
    const userId = client.data.user.sub;

    // Check permission
    try {
      await this.documentsService.findOne(userId, documentId);
      await client.join(`doc:${documentId}`);
      console.log(`User ${userId} joined doc:${documentId}`);

      // Notify others
      client.to(`doc:${documentId}`).emit("user-joined", { userId });

      return { status: "ok" };
    } catch (error) {
      return { status: "error", message: "Unauthorized" };
    }
  }

  @SubscribeMessage("leave")
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const { documentId } = data;
    await client.leave(`doc:${documentId}`);
    client
      .to(`doc:${documentId}`)
      .emit("user-left", { userId: client.data.user.sub });
  }

  @SubscribeMessage("update")
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; update: string }, // update is base64 encoded string of encrypted blob
  ) {
    const { documentId, update } = data;
    const userId = client.data.user.sub;

    // Save update to DB
    // We store it as Bytes
    const updateBuffer = Buffer.from(update, "base64");

    await this.prisma.documentUpdate.create({
      data: {
        documentId,
        update: updateBuffer,
      },
    });

    // Broadcast to others
    client.to(`doc:${documentId}`).emit("update", {
      userId,
      update, // Send back as base64
    });
  }

  @SubscribeMessage("sync")
  async handleSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const { documentId } = data;
    const userId = client.data.user.sub;

    // Check permission
    try {
      await this.documentsService.findOne(userId, documentId);

      // Fetch all updates
      const updates = await this.prisma.documentUpdate.findMany({
        where: { documentId },
        orderBy: { createdAt: "asc" },
        select: { update: true },
      });

      // Convert buffers to base64 strings
      const updatesBase64 = updates.map((u) =>
        Buffer.from(u.update).toString("base64"),
      );

      return { updates: updatesBase64 };
    } catch (error) {
      return { status: "error", message: "Unauthorized" };
    }
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(" ")[0] === "Bearer") {
      return authHeader.split(" ")[1];
    }
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === "string") {
      return queryToken;
    }
    return undefined;
  }
}
