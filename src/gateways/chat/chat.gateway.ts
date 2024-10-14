import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from 'src/chat/schemas/chat-message.schema';

@WebSocketGateway({
  namespace: 'lecture-chat',
  cors: {
    origin: '*',
  },
})
export class LectureChatGateway {
  @WebSocketServer() server: Server;

  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    message: MessageDto,
  ): Promise<void> {
    const { lectureId, text, user } = message;

    const chatMessage = new this.chatMessageModel({
      lectureId,
      user,
      text,
    });

    await chatMessage.save();

    this.server.to(lectureId).emit('receiveMessage', {
      text,
      user,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('fetchMessages')
  async handleFetchMessages(
    @MessageBody()
    {
      lectureId,
      page,
      limit,
    }: { lectureId: string; page: number; limit: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const messages = await this.chatMessageModel
      .find({ lectureId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip((page - 1) * limit) // Pagination logic
      .limit(limit);

    // Emit the fetched messages back to the client
    client.emit('loadMessages', messages);
  }

  @SubscribeMessage('userTyping')
  handleUserTyping(
    @MessageBody() { lectureId, userId }: { lectureId: string; userId: string },
  ): void {
    this.server.to(lectureId).emit('userTyping', { userId });
  }

  @SubscribeMessage('userStoppedTyping')
  handleUserStoppedTyping(
    @MessageBody() { lectureId, userId }: { lectureId: string; userId: string },
  ): void {
    this.server.to(lectureId).emit('userStoppedTyping', { userId });
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    const lectureId = client.handshake.query.lectureId as string;
    client.join(lectureId);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const lectureId = client.handshake.query.lectureId as string;
    client.leave(lectureId);
  }
}
