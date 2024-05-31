import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LectureDto {
  @ApiProperty({ description: 'The ID of the lecture' })
  id: number;

  @ApiProperty({ description: 'The title of the lecture' })
  title: string;

  @ApiPropertyOptional({ description: 'The description of the lecture' })
  description?: string | null;

  @ApiProperty({ description: 'The start date of the lecture' })
  createdAt: Date;

  @ApiProperty({ description: 'The end date of the lecture' })
  updatedAt: Date;

  @ApiProperty({ description: 'The start date of the lecture' })
  startTime: Date;

  @ApiProperty({ description: 'The end date of the lecture' })
  endTime: Date;

  @ApiProperty({ description: 'The ID of the speaker' })
  speakerId: number;

  @ApiProperty({ description: 'The ID of the event' })
  eventId: number | null;

  @ApiProperty()
  participants?: { id: number }[];
}
