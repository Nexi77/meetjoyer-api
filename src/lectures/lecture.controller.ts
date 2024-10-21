import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
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
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { GetLecturesDto } from './dto/get-lectures.dto';
import { ApiPaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { SignInOutDto } from './dto/sign-in-out.dto';
import { Response } from 'express';
import { PdfService } from 'src/pdf/pdf.service';

@ApiTags('Lectures')
@UseGuards(RolesGuard)
@Controller('lectures')
export class LectureController {
  constructor(
    private readonly lectureService: LectureService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
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
  async getAllLectures(
    @Query() getLecturesDto: GetLecturesDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.lectureService.getAllLectures(getLecturesDto, userId);
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

  @Get('/questions/:lectureId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'File with list of questions' })
  @ApiNotFoundResponse({ description: 'Lecture not found' })
  @ApiParam({
    name: 'lectureId',
    description: 'ID of the lecture to retrieve questions from',
  })
  async getLectureQuestions(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @GetCurrentUserId() speakerId: number,
    @Res() res: Response,
  ) {
    const { lectureDto, modelResponse } =
      await this.lectureService.generateLectureQuestionsResponse(
        lectureId,
        speakerId,
      );

    this.pdfService.generateLecturePdf(
      lectureDto.title,
      lectureDto.description,
      modelResponse.questions,
      res,
    );
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

  @Put(':id')
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

  @Post('signin')
  @ApiOkResponse({
    description: 'The lecture has been successfully updated.',
    type: LectureDto,
  })
  @ApiBearerAuth()
  async signIn(
    @GetCurrentUserId() userId: number,
    @Body() signInOutDto: SignInOutDto,
  ) {
    return this.lectureService.signInToLecture(userId, signInOutDto);
  }

  @Post('signout')
  @ApiOkResponse({
    description: 'The lecture has been successfully updated.',
    type: LectureDto,
  })
  @ApiBearerAuth()
  async signOut(
    @GetCurrentUserId() userId: number,
    @Body() signInOutDto: SignInOutDto,
  ) {
    return this.lectureService.signOutFromLecture(userId, signInOutDto);
  }
}
