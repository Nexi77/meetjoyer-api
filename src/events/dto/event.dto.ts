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

  @ApiProperty({ description: 'Start date of the Event' })
  startDate: Date;

  @ApiProperty({ description: 'End date of the Event' })
  endDate: Date;

  @ApiProperty({ description: 'Description of the event' })
  description: string;

  @ApiProperty({ description: 'How mnany users will take part in the event' })
  participantsNumber: number;

  @ApiProperty({
    description: 'The lectures associated with the event',
    type: [LectureDto],
  })
  lectures: LectureDto[];

  @ApiPropertyOptional({
    description: 'Main image of the event',
  })
  image: string | null;

  constructor(init: Partial<EventDto>) {
    Object.assign(this, {
      id: init.id,
      name: init.name,
      location: init.location,
      eventType: init.eventType,
      startDate: init.startDate,
      endDate: init.endDate,
      organiser: new SafeUser(init.organiser as SafeUser),
      lectures: init.lectures?.map((lecture) => new LectureDto(lecture)) ?? [],
      participantsNumber:
        init.lectures?.reduce((acc, lecture) => {
          // If `participants` is undefined, treat it as an empty array
          const participantCount = lecture.participants
            ? lecture.participants?.length
            : 0;
          return acc + participantCount;
        }, 0) || 0,
      image: init.image,
      description: init.description,
    });
  }
}
