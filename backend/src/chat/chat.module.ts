import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { GroupChatService } from "./group-chat.service";
import { GroupChatController } from "./group-chat.controller";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [JwtModule, DatabaseModule, ConfigModule],
  controllers: [ChatController, GroupChatController],
  providers: [ChatService, GroupChatService, ChatGateway],
  exports: [ChatService, GroupChatService, ChatGateway],
})
export class ChatModule {}
