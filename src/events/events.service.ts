import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LectureDto } from 'src/lectures/dto/lecture.dto';
import { SafeUser } from 'src/user/dto/safe-user.dto';
import { EventDto } from './dto/event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEvent(
    createEventDto: CreateEventDto,
    organiserId: number,
  ): Promise<CreateEventDto> {
    const { name, location, eventType, lectureIds } = createEventDto;

    // Check if the organiser exists
    const organiser = await this.prismaService.user.findUnique({
      where: { id: organiserId },
    });

    if (!organiser) {
      throw new BadRequestException('Organiser not found');
    }

    // Validate lecture IDs if provided
    if (lectureIds) {
      const existingLectures = await this.prismaService.lecture.findMany({
        where: {
          id: { in: lectureIds },
        },
        select: { id: true },
      });

      const existingLectureIds = new Set(
        existingLectures.map((lecture) => lecture.id),
      );
      const invalidLectureIds = lectureIds.filter(
        (id) => !existingLectureIds.has(id),
      );

      if (invalidLectureIds.length > 0) {
        throw new NotFoundException(
          `Lectures with IDs ${invalidLectureIds.join(', ')} not found`,
        );
      }
    }

    return this.prismaService.event.create({
      data: {
        name,
        location,
        organiserId,
        eventType,
        lectures:
          lectureIds && lectureIds.length > 0
            ? {
                connect: lectureIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });
  }

  async getAllEvents(): Promise<EventDto[]> {
    const events = await this.prismaService.event.findMany({
      include: { organiser: true, lectures: true },
    });

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      location: event.location,
      eventType: event.eventType,
      organiser: {
        id: event.organiser.id,
        email: event.organiser.email,
        roles: event.organiser.roles,
        updatedAt: event.organiser.updatedAt,
        createdAt: event.organiser.createdAt,
      },
      lectures: event.lectures.map((lecture) => ({
        id: lecture.id,
        title: lecture.title,
        createdAt: lecture.createdAt,
        updatedAt: lecture.updatedAt,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        speakerId: lecture.speakerId,
        eventId: lecture.eventId,
      })),
    }));
  }

  async getEventById(eventId: number): Promise<EventDto> {
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
      include: {
        organiser: true,
        lectures: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const safeUser: SafeUser = {
      id: event.organiser.id,
      email: event.organiser.email,
      roles: event.organiser.roles,
      updatedAt: event.organiser.updatedAt,
      createdAt: event.organiser.createdAt,
    };

    const lectures: LectureDto[] = event.lectures.map((lecture) => ({
      id: lecture.id,
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt,
      title: lecture.title,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      speakerId: lecture.speakerId,
      eventId: lecture.eventId,
    }));

    return {
      id: event.id,
      name: event.name,
      location: event.location,
      eventType: event.eventType,
      organiser: safeUser,
      lectures: lectures,
    };
  }

  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
  ): Promise<string> {
    const existingEvent = await this.prismaService.event.findUnique({
      where: { id: eventId },
      include: { lectures: true },
    });
    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (updateEventDto.lectures) {
      const existingLectures = await this.prismaService.lecture.findMany({
        where: { id: { in: updateEventDto.lectures } },
      });

      // Check if all provided lecture IDs exist
      if (existingLectures.length !== updateEventDto.lectures.length) {
        throw new NotFoundException(
          'One or more provided lecture IDs do not exist',
        );
      }
    }

    await this.prismaService.event.update({
      where: { id: eventId },
      data: {
        name: updateEventDto.name,
        location: updateEventDto.location,
        eventType: updateEventDto.eventType,
        // Connect provided lectures and disconnect the rest
        lectures: {
          connect: updateEventDto.lectures?.map((lectureId) => ({
            id: lectureId,
          })),
          disconnect: updateEventDto.lectures
            ? existingEvent.lectures.filter(
                (lecture) => !updateEventDto.lectures?.includes(lecture.id),
              )
            : undefined,
        },
      },
      include: { lectures: true },
    });

    return `Event with id: ${eventId} successfully updated`;
  }

  async deleteEventById(eventId: number): Promise<string> {
    // Find the event
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Delete the event and associated lectures
    await this.prismaService.event.delete({
      where: { id: eventId },
      include: { lectures: true },
    });

    return `Event with id: ${eventId} was succesfully deleted`;
  }
}
