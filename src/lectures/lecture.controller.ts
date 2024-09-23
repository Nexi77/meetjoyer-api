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
  Query,
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
import { GetLecturesDto } from './dto/get-lectures.dto';
import { ApiPaginatedResponse } from 'src/common/decorators/paginated-response.decorator';

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
  async createLecture(@Body() createLectureDto: CreateLectureDto) {
    return this.lectureService.createLecture(createLectureDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiPaginatedResponse(LectureDto)
  async getAllLectures(@Query() getLecturesDto: GetLecturesDto) {
    return this.lectureService.getAllLectures(getLecturesDto);
  }

  @Get('no-pagination')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'List of all lectures without pagination',
    type: [LectureDto],
  })
  async getAllLecturesWithNoPagination() {
    return this.lectureService.getAllLecturesWithNoPagination();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Details of the lecture', type: LectureDto })
  @ApiNotFoundResponse({ description: 'Lecture not found' })
  @ApiParam({ name: 'id', description: 'ID of the lecture to retrieve' })
  async getLectureById(@Param('id', ParseIntPipe) lectureId: number) {
    return await this.lectureService.getLectureById(lectureId);
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
  ) {
    return this.lectureService.updateLecture(lectureId, updateLectureDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: 'Lecture not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({
    description: 'The lecture has been successfully deleted.',
    type: LectureDto,
  })
  @ApiParam({ name: 'id', description: 'ID of the lecture to delete' })
  async deleteLectureById(@Param('id', ParseIntPipe) lectureId: number) {
    return this.lectureService.deleteLectureById(lectureId);
  }
}
