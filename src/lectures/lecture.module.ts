import { Module } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { LectureController } from './lecture.controller';
import { ChatModule } from 'src/chat/modules/chat.module';
import { OpenAIModule } from 'src/openai/openai.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  imports: [ChatModule, OpenAIModule, PdfModule],
  controllers: [LectureController],
  providers: [LectureService],
  exports: [LectureService],
})
export class LectureModule {}
