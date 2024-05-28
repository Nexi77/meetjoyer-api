import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Name of the event' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Location of the event' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Type of the event', enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

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
