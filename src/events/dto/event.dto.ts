import { ApiProperty } from '@nestjs/swagger';
import { LectureDto } from 'src/lectures/dto/lecture.dto';
import { SafeUser } from 'src/user/dto/safe-user.dto';
import { EventType } from '@prisma/client';

export class EventDto {
  @ApiProperty({ description: 'The ID of the event' })
  id: number;

  @ApiProperty({ description: 'The name of the event' })
  name: string;

  @ApiProperty({ description: 'The location of the event' })
  location: string;

  @ApiProperty({ description: 'The type of the event', enum: EventType })
  eventType: EventType;

  @ApiProperty({ description: 'The organiser of the event', type: SafeUser })
  organiser: SafeUser;

  @ApiProperty({
    description: 'The lectures associated with the event',
    type: [LectureDto],
  })
  lectures: LectureDto[];
}
