import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SafeUser } from 'src/user/dto/safe-user.dto';

export class LectureDto {
  @ApiProperty({ description: 'The ID of the lecture' })
  id: number;

  @ApiProperty({ description: 'The title of the lecture' })
  title: string;

  @ApiPropertyOptional({ description: 'The description of the lecture' })
  description?: string | null;

  @ApiProperty({
    description: 'User object representing speaker of this lecture',
  })
  speaker: SafeUser;

  @ApiProperty({
    description: 'The ID of the event the lecture is associated with',
  })
  eventId: number | null;

  @ApiProperty()
  participants?: SafeUser[];

  constructor(partial: Partial<LectureDto>) {
    Object.assign(this, {
      id: partial.id,
      title: partial.title,
      description: partial.description,
      speaker: partial.speaker ? new SafeUser(partial.speaker) : undefined,
      eventId: partial.eventId,
      participants:
        partial.participants?.map((participant) => new SafeUser(participant)) ??
        [],
    });
  }
}
