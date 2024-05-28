import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { LectureModule } from 'src/lectures/lecture.module';

@Module({
  imports: [LectureModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
