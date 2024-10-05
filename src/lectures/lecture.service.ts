import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { LectureDto } from './dto/lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { GetLecturesDto } from './dto/get-lectures.dto';
import { getParsedPaginationAndRest } from 'src/common/utils/pagination-util';
import { PaginatedResource } from 'src/common/pagination/dto/paginated_resource.dto';

@Injectable()
export class LectureService {
  constructor(private readonly prismaService: PrismaService) {}

  async createLecture(createLectureDto: CreateLectureDto) {
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
    const participants = createLectureDto.participants
      ? await this.prismaService.user.findMany({
          where: { id: { in: createLectureDto.participants } },
        })
      : [];
    if (
      createLectureDto.participants &&
      participants.length !== createLectureDto.participants.length
    ) {
      throw new NotFoundException('One or more participant IDs do not exist');
    }
    const lecture = await this.prismaService.lecture.create({
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
        participants: {
          connect: participants.map((participant) => ({ id: participant.id })),
        },
      },
      include: { participants: true, speaker: true },
    });
    return new LectureDto(lecture);
  }

  async getAllLectures(getLecturesDto: GetLecturesDto, userId: number) {
    const { skip, limit, page, type, ...filters } =
      getParsedPaginationAndRest<GetLecturesDto>(getLecturesDto);
    const where: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        where[key] = {
          contains: value,
          mode: 'insensitive',
        };
      }
    });
    if (type === 'mine') {
      where.participants = {
        some: {
          id: userId,
        },
      };
    }
    const [data, totalItems] = await Promise.all([
      await this.prismaService.lecture.findMany({
        include: {
          speaker: true,
          participants: true,
        },
        where,
        skip,
        take: limit,
      }),
      this.prismaService.lecture.count(),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    const lectures = data.map((lecture) => new LectureDto(lecture));
    return new PaginatedResource<LectureDto>(lectures, totalPages, page, limit);
  }

  async getAllLecturesWithNoPagination() {
    const lectures = await this.prismaService.lecture.findMany({
      include: {
        speaker: true,
        participants: true,
      },
    });
    return lectures.map((lecture) => new LectureDto(lecture));
  }

  async getLectureById(lectureId: number) {
    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
      include: {
        speaker: true,
        participants: true,
      },
    });
    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }
    return new LectureDto(lecture);
  }

  async updateLecture(lectureId: number, updateLectureDto: UpdateLectureDto) {
    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
    });
    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }
    if (
      updateLectureDto.eventId !== null &&
      updateLectureDto.eventId !== undefined
    ) {
      const event = await this.prismaService.event.findUnique({
        where: { id: updateLectureDto.eventId },
      });
      if (!event) {
        throw new NotFoundException(
          `Event with ID ${updateLectureDto.eventId} not found`,
        );
      }
    }
    if (
      updateLectureDto.speakerId !== null &&
      updateLectureDto.speakerId !== undefined
    ) {
      const speaker = await this.prismaService.user.findUnique({
        where: { id: updateLectureDto.speakerId },
      });
      if (!speaker) {
        throw new NotFoundException(
          `Speaker with ID ${updateLectureDto.speakerId} not found`,
        );
      }
    }
    const participants = updateLectureDto.participants
      ? await this.prismaService.user.findMany({
          where: { id: { in: updateLectureDto.participants } },
        })
      : [];
    if (
      updateLectureDto.participants &&
      participants.length !== updateLectureDto.participants.length
    ) {
      throw new NotFoundException('One or more participant IDs do not exist');
    }
    const updatedLecture = await this.prismaService.lecture.update({
      where: { id: lectureId },
      data: {
        title: updateLectureDto.title,
        description: updateLectureDto.description,
        startTime: updateLectureDto.startTime,
        endTime: updateLectureDto.endTime,
        eventId: updateLectureDto.eventId,
        speakerId: updateLectureDto.speakerId,
        participants: {
          set: participants.map((participant) => ({ id: participant.id })),
        },
      },
      include: { participants: true, speaker: true },
    });
    return new LectureDto(updatedLecture);
  }

  async deleteLectureById(lectureId: number) {
    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
    });
    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }
    const deletedLecture = await this.prismaService.lecture.delete({
      where: { id: lectureId },
      include: { participants: true, speaker: true },
    });
    return new LectureDto(deletedLecture);
  }
}
