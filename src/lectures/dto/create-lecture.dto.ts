import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @IsInt()
  @ApiProperty({
    description: 'The ID of the event this lecture belongs to',
  })
  eventId: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the speaker for this lecture' })
  speakerId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  participants?: number[];
}
