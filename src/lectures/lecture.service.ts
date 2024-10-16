import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { LectureDto } from './dto/lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { GetLecturesDto } from './dto/get-lectures.dto';
import { getParsedPaginationAndRest } from 'src/common/utils/pagination-util';
import { PaginatedResource } from 'src/common/pagination/dto/paginated_resource.dto';
import { SignInOutDto } from './dto/sign-in-out.dto';

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
        event: { connect: { id: createLectureDto.eventId } },
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
    const { skip, limit, page, type, speakerEmail, sortBy, ...filters } =
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
    if (speakerEmail) {
      where.speaker = {
        email: {
          contains: speakerEmail,
          mode: 'insensitive',
        },
      };
    }

    const orderBy: any = [];

    if (sortBy) {
      if (sortBy === 'startDate') {
        orderBy.push({
          event: {
            startDate: 'asc',
          },
        });
      } else {
        orderBy.push({
          [sortBy]: 'asc',
        });
      }
    }

    const [data, totalItems] = await Promise.all([
      await this.prismaService.lecture.findMany({
        include: {
          speaker: true,
          participants: true,
          event: true,
        },
        where,
        orderBy,
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

  async signInToLecture(userId: number, signInOutDto: SignInOutDto) {
    const { lectureId } = signInOutDto;

    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
      include: { participants: true },
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    // Check if the user is already a participant
    const isAlreadyParticipant = lecture.participants.some(
      (participant) => participant.id === userId,
    );

    if (isAlreadyParticipant) {
      throw new BadRequestException(
        `User is already a participant in this lecture`,
      );
    }

    const updatedLecture = await this.prismaService.lecture.update({
      where: { id: lectureId },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
    });
    return new LectureDto(updatedLecture);
  }

  async signOutFromLecture(userId: number, signInOutDto: SignInOutDto) {
    const { lectureId } = signInOutDto;

    const lecture = await this.prismaService.lecture.findUnique({
      where: { id: lectureId },
      include: { participants: true },
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    // Check if the user is a participant
    const isParticipant = lecture.participants.some(
      (participant) => participant.id === userId,
    );

    if (!isParticipant) {
      throw new BadRequestException(
        `User is not a participant in this lecture`,
      );
    }

    const updatedLecture = await this.prismaService.lecture.update({
      where: { id: lectureId },
      data: {
        participants: {
          disconnect: { id: userId },
        },
      },
    });

    return new LectureDto(updatedLecture);
  }
}
