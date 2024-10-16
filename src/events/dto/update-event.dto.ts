import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { IsGeoLocation } from 'src/common/decorators/is-geo-location.decorator';

export class UpdateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the event' })
  name: string;

  @ApiProperty({ description: 'Image of the event' })
  image: string | null;

  @ApiProperty({ description: 'Geolocation of the event' })
  @IsNotEmpty()
  @IsGeoLocation()
  geolocation: [number, number];

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The start time of the event' })
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The end time of the event' })
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The location of the event' })
  location: string;

  @ApiProperty({ description: 'Type of the event', enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({
    description: 'List of lecture IDs associated with the event',
    type: [Number],
  })
  @IsArray()
  lectureIds?: number[];
}
