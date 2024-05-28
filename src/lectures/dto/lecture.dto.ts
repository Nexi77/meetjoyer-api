import { ApiProperty } from '@nestjs/swagger';

export class LectureDto {
  @ApiProperty({ description: 'The ID of the lecture' })
  id: number;

  @ApiProperty({ description: 'The title of the lecture' })
  title: string;

  @ApiProperty({ description: 'The start date of the lecture' })
  startTime: Date;

  @ApiProperty({ description: 'The end date of the lecture' })
  endTime: Date;

  @ApiProperty({ description: 'The ID of the speaker' })
  speakerId: number;

  @ApiProperty({ description: 'The ID of the event' })
  eventId: number;
}
