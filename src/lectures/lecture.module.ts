import { Module } from '@nestjs/common';
import { LectureService } from './lecture.service';

@Module({
  controllers: [],
  providers: [LectureService],
  exports: [LectureService],
})
export class LectureModule {}
