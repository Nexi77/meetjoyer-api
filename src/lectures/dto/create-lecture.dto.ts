import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateLectureDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The title of the lecture' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The description of the lecture',
    required: false,
  })
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The start time of the lecture' })
  startTime: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The end time of the lecture' })
  endTime: Date;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'The ID of the event this lecture belongs to',
  })
  eventId?: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the speaker for this lecture' })
  speakerId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  participants?: number[];
}
