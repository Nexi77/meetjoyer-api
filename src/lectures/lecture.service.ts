import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { LectureDto } from './dto/lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Lecture } from '@prisma/client';

@Injectable()
export class LectureService {
  constructor(private readonly prismaService: PrismaService) {}

  async createLecture(createLectureDto: CreateLectureDto): Promise<LectureDto> {
    if (createLectureDto.eventId) {
      const event = await this.prismaService.event.findUnique({
        where: { id: createLectureDto.eventId },
      });
      if (!event) {
        throw new NotFoundException(
          `Event with ID ${createLectureDto.eventId} not found`,
        );
      }
    }

    const speaker = await this.prismaService.user.findUnique({
      where: { id: createLectureDto.speakerId },
    });
    if (!speaker) {
      throw new NotFoundException(
        `Speaker with ID ${createLectureDto.speakerId} not found`,
      );
    }

    return this.prismaService.lecture.create({
      data: {
        title: createLectureDto.title,
        description: createLectureDto.description,
        startTime: createLectureDto.startTime,
        endTime: createLectureDto.endTime,
        event: createLectureDto.eventId
          ? { connect: { id: createLectureDto.eventId } }
          : undefined,
        speaker: {
          connect: { id: createLectureDto.speakerId },
        },
      },
    });
  }

  async getAllLectures(): Promise<Lecture[]> {
    return this.prismaService.lecture.findMany({
      include: {
        event: true,
        speaker: true,
      },
    });
  }

  async getLectureById(lectureId: number): Promise<Lecture> {
    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
      include: {
        event: true,
        speaker: true,
      },
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    return lecture;
  }

  async updateLecture(
    lectureId: number,
    updateLectureDto: UpdateLectureDto,
  ): Promise<LectureDto> {
    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
    });
    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    if (updateLectureDto.eventId) {
      const event = await this.prismaService.event.findUnique({
        where: { id: updateLectureDto.eventId },
      });
      if (!event) {
        throw new NotFoundException(
          `Event with ID ${updateLectureDto.eventId} not found`,
        );
      }
    }

    if (updateLectureDto.speakerId) {
      const speaker = await this.prismaService.user.findUnique({
        where: { id: updateLectureDto.speakerId },
      });
      if (!speaker) {
        throw new NotFoundException(
          `Speaker with ID ${updateLectureDto.speakerId} not found`,
        );
      }
    }

    return this.prismaService.lecture.update({
      where: { id: lectureId },
      data: {
        title: updateLectureDto.title,
        description: updateLectureDto.description,
        startTime: updateLectureDto.startTime,
        endTime: updateLectureDto.endTime,
        eventId: updateLectureDto.eventId,
        speakerId: updateLectureDto.speakerId,
      },
    });
  }

  async deleteLectureById(lectureId: number): Promise<string> {
    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
      include: {
        event: true,
      },
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    await this.prismaService.lecture.delete({
      where: { id: lectureId },
    });

    return `Lecture with id: ${lectureId} was deleted`;
  }

  async deleteLecturesByEventId(eventId: number): Promise<void> {
    await this.prismaService.lecture.deleteMany({ where: { eventId } });
  }
}
