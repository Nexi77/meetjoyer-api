import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { LectureService } from './lecture.service';
import { LectureDto } from './dto/lecture.dto';
import { Roles } from 'src/common/decorators';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateLectureDto } from './dto/update-lecture.dto';

@ApiTags('Lectures')
@UseGuards(RolesGuard)
@Controller('lectures')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.ORGANISER)
  @ApiCreatedResponse({
    description: 'The lecture has been successfully created.',
    type: LectureDto,
  })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'Event or speaker not found' })
  async createLecture(
    @Body() createLectureDto: CreateLectureDto,
  ): Promise<LectureDto> {
    return this.lectureService.createLecture(createLectureDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of all lectures', type: [LectureDto] })
  async getAllLectures(): Promise<LectureDto[]> {
    const lectures = await this.lectureService.getAllLectures();
    return lectures.map((lecture) => ({
      id: lecture.id,
      title: lecture.title,
      description: lecture.description,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      eventId: lecture.eventId,
      speakerId: lecture.speakerId,
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt,
    }));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Details of the lecture', type: LectureDto })
  @ApiNotFoundResponse({ description: 'Lecture not found' })
  @ApiParam({ name: 'id', description: 'ID of the lecture to retrieve' })
  async getLectureById(
    @Param('id', ParseIntPipe) lectureId: number,
  ): Promise<LectureDto> {
    const lecture = await this.lectureService.getLectureById(lectureId);
    return {
      id: lecture.id,
      title: lecture.title,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      eventId: lecture.eventId,
      speakerId: lecture.speakerId,
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt,
      participants:
        lecture.participants?.map((participant) => ({
          id: participant.id,
        })) ?? [],
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.ORGANISER)
  @ApiOkResponse({
    description: 'The lecture has been successfully updated.',
    type: LectureDto,
  })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'Lecture, event, or speaker not found' })
  async updateLecture(
    @Param('id', ParseIntPipe) lectureId: number,
    @Body() updateLectureDto: UpdateLectureDto,
  ): Promise<LectureDto> {
    return this.lectureService.updateLecture(lectureId, updateLectureDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: 'Lecture not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'ID of the lecture to delete' })
  async deleteLectureById(
    @Param('id', ParseIntPipe) lectureId: number,
  ): Promise<string> {
    return await this.lectureService.deleteLectureById(lectureId);
  }
}
