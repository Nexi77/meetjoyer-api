import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsGeoLocation } from 'src/common/decorators/is-geo-location.decorator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the event' })
  name?: string;

  @ApiProperty({ description: 'Geolocation of the event' })
  @IsNotEmpty()
  @IsGeoLocation()
  geolocation: [number, number];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The location of the event' })
  location?: string;

  @IsOptional()
  @ApiProperty({ description: 'Type of the event', enum: EventType })
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional({
    description: 'List of lecture IDs associated with the event',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ApiProperty({ description: 'Array of lectures to update' })
  lectures?: number[];
}
