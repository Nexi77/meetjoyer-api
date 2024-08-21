import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    description: 'Main image of the event',
  })
  image: string | null;

  constructor(init: EventDto) {
    Object.assign(this, {
      id: init.id,
      name: init.name,
      location: init.location,
      eventType: init.eventType,
      organiser: new SafeUser(init.organiser),
      lectures: init.lectures?.map((lecture) => new LectureDto(lecture)) ?? [],
      image: init.image,
    });
  }
}
