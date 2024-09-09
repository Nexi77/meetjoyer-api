import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventDto } from './dto/event.dto';
import { PaginatedResource } from 'src/common/pagination/dto/paginated_resource.dto';
import { GetEventsDto } from './dto/get-events-dto';
import { EventType } from './enums/event-type.enum';
import { getParsedPaginationAndRest } from 'src/common/utils/pagination-util';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEvent(createEventDto: CreateEventDto, organiserId: number) {
    const {
      name,
      location,
      eventType,
      lectureIds,
      startDate,
      endDate,
      description,
    } = createEventDto;
    const organiser = await this.prismaService.user.findUnique({
      where: { id: organiserId },
    });
    if (!organiser) {
      throw new BadRequestException('Organiser not found');
    }

    if (lectureIds) {
      const existingLectures = await this.prismaService.lecture.findMany({
        where: {
          id: { in: lectureIds },
        },
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
    const event = await this.prismaService.event.create({
      data: {
        name,
        startDate,
        endDate,
        location,
        organiserId,
        description,
        eventType,
        lectures: lectureIds?.length
          ? { connect: lectureIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        organiser: true,
        lectures: {
          include: {
            speaker: true,
            participants: true,
          },
        },
      },
    });

    return new EventDto(event);
  }

  async getAllEvents(getEventsDto: GetEventsDto, userId: number) {
    const { skip, limit, page, type, ...filters } =
      getParsedPaginationAndRest<GetEventsDto>(getEventsDto);
    const where: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        where[key] = {
          contains: value,
          mode: 'insensitive',
        };
      }
    });
    if (type) this.filterEventsBasedOnType(type, where, userId);
    const [data, totalItems] = await Promise.all([
      this.prismaService.event.findMany({
        skip,
        take: limit,
        where,
        include: {
          organiser: true,
          lectures: {
            include: {
              speaker: true,
              participants: true,
            },
          },
        },
      }),
      this.prismaService.event.count(),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    const events = data.map((event) => new EventDto(event));
    return new PaginatedResource<EventDto>(events, totalPages, page, limit);
  }

  async getEventById(eventId: number) {
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
      include: {
        organiser: true,
        lectures: {
          include: {
            speaker: true,
            participants: true,
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return new EventDto(event);
  }

  async updateEvent(eventId: number, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.prismaService.event.findUnique({
      where: { id: eventId },
      include: {
        lectures: true,
      },
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
    const event = await this.prismaService.event.update({
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
          disconnect: existingEvent.lectures
            .filter((lecture) => !updateEventDto.lectures?.includes(lecture.id))
            .map((lecture) => ({ id: lecture.id })),
        },
      },
      include: {
        organiser: true,
        lectures: {
          include: {
            speaker: true,
            participants: true,
          },
        },
      },
    });

    return new EventDto(event);
  }

  async deleteEventById(eventId: number) {
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    const deletedEvent = await this.prismaService.event.delete({
      where: { id: eventId },
      include: {
        organiser: true,
        lectures: {
          include: {
            speaker: true,
            participants: true,
          },
        },
      },
    });
    return new EventDto(deletedEvent);
  }

  private filterEventsBasedOnType(
    type: EventType,
    whereClauseObject: Record<string, any>,
    userId: number,
  ) {
    switch (type) {
      case EventType.ONGOING:
        whereClauseObject.startDate = {
          lte: new Date(), // Less than or equal to the current date for ongoing events
        };
        whereClauseObject.endDate = {
          gte: new Date(), // Greater than or equal to the current date to ensure it's still ongoing
        };
        break;
      case EventType.UPCOMING:
        whereClauseObject.startDate = {
          gt: new Date(),
        };
        break;
      case EventType.MINE:
        whereClauseObject.lectures = {
          some: {
            participants: {
              some: {
                id: userId, // User is a participant in the event's lectures
              },
            },
          },
        };
    }
  }
}
