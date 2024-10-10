import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SafeUser } from 'src/user/dto/safe-user.dto';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true })
  lectureId: string;

  @Prop({ required: true })
  user: SafeUser;

  @Prop({ required: true })
  text: string;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
