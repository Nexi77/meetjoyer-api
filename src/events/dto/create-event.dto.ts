import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsGeoLocation } from 'src/common/decorators/is-geo-location.decorator';

export class CreateEventDto {
  @ApiProperty({ description: 'Name of the event' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Geolocation of the event' })
  @IsNotEmpty()
  @IsGeoLocation()
  geolocation: [number, number];

  @ApiProperty({ description: 'Location of the event' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The start time of the event' })
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The end time of the event' })
  endDate: Date;

  @ApiProperty({ description: 'Type of the event', enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ description: 'Text description of the event' })
  description: string;

  @ApiPropertyOptional({ description: 'Image url of the event' })
  image: string;

  @ApiPropertyOptional({
    description: 'List of lecture IDs associated with the event',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  lectureIds?: number[];
}
