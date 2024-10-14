import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateLectureDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ description: 'The title of the lecture' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The description of the lecture',
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'The ID of the event this lecture belongs to',
  })
  eventId?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'The ID of the speaker for this lecture',
  })
  speakerId?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  participants?: number[];
}
