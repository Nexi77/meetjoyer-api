import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from '../schemas/chat-message.schema';
import { LectureChatGateway } from 'src/gateways/chat/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  providers: [LectureChatGateway],
  exports: [MongooseModule, LectureChatGateway],
})
export class ChatModule {}
