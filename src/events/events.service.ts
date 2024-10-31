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
import { EventWithGeoData } from './dto/event-with-geo-data.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEvent(createEventDto: CreateEventDto, organiserId: number) {
    const {
      name,
      location,
      eventType,
      image,
      lectureIds,
      geolocation,
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
        image,
        lat: geolocation[0],
        lng: geolocation[1],
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
    const { skip, limit, page, type, startDate, endDate, ...filters } =
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
    if (type)
      this.filterEventsBasedOnType(type, where, userId, startDate, endDate);
    else {
      if (startDate) {
        where.startDate = {
          gte: new Date(startDate),
        };
      }
      if (endDate) {
        where.endDate = {
          lte: new Date(endDate),
        };
      }
    }
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
    const events = data.map((event) => {
      const geolocEvent = new EventWithGeoData(event);
      return new EventDto(geolocEvent);
    });
    return new PaginatedResource<EventDto>(events, totalPages, page, limit);
  }

  async getAllEventsWithNoPagination() {
    const data = await this.prismaService.event.findMany({
      include: {
        organiser: true,
      },
    });
    const events = data.map((event) => {
      const geolocEvent = new EventWithGeoData(event);
      return new EventDto(geolocEvent);
    });
    return events.map((event) => new EventDto(event));
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
    const eventWithGeoLoc = new EventWithGeoData(event);
    return new EventDto(eventWithGeoLoc);
  }

  async updateEvent(eventId: number, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.prismaService.event.findUnique({
      where: { id: eventId },
      include: {
        lectures: true, // Fetch current associated lectures
      },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Check if provided lecture IDs exist if provided
    if (updateEventDto.lectureIds) {
      const existingLectures = await this.prismaService.lecture.findMany({
        where: { id: { in: updateEventDto.lectureIds } },
      });

      // Check if all provided lecture IDs exist
      if (existingLectures.length !== updateEventDto.lectureIds.length) {
        throw new NotFoundException(
          'One or more provided lecture IDs do not exist',
        );
      }
    }

    // Identify lectures to be removed (i.e., those that will be disconnected)
    const lecturesToRemove = existingEvent.lectures.filter(
      (lecture) => !updateEventDto.lectureIds?.includes(lecture.id),
    );

    // First, delete the lectures that will be removed
    if (lecturesToRemove.length > 0) {
      await Promise.all(
        lecturesToRemove.map((lecture) =>
          this.prismaService.lecture.delete({
            where: { id: lecture.id },
          }),
        ),
      );
    }

    // Now update the event
    const event = await this.prismaService.event.update({
      where: { id: eventId },
      data: {
        name: updateEventDto.name,
        location: updateEventDto.location,
        startDate: updateEventDto.startDate,
        endDate: updateEventDto.endDate,
        lat: updateEventDto.geolocation[0],
        lng: updateEventDto.geolocation[1],
        eventType: updateEventDto.eventType,
        image: updateEventDto.image,
        // Connect provided lectures
        lectures: {
          connect: updateEventDto.lectureIds?.map((lectureId) => ({
            id: lectureId,
          })),
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

    const eventWithGeoLoc = new EventWithGeoData(event);
    return new EventDto(eventWithGeoLoc);
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
    startDate?: string,
    endDate?: string,
  ) {
    const currentDate = new Date();
    switch (type) {
      case EventType.ONGOING:
        // Base condition for ongoing events
        whereClauseObject.startDate = { lte: currentDate };
        whereClauseObject.endDate = { gte: currentDate };

        // Refine startDate and endDate if provided by the user
        if (startDate) {
          const userStartDate = new Date(startDate);
          whereClauseObject.startDate = {
            lte: currentDate, // Ensure it’s ongoing
            gte: userStartDate > currentDate ? currentDate : userStartDate, // Use user startDate only if before currentDate
          };
        }
        if (endDate) {
          const userEndDate = new Date(endDate);
          whereClauseObject.endDate = {
            gte: currentDate, // Ensure it’s ongoing
            lte: userEndDate < currentDate ? currentDate : userEndDate, // Use user endDate only if after currentDate
          };
        }
        break;
      case EventType.UPCOMING:
        // Base condition for upcoming events
        whereClauseObject.startDate = { gt: currentDate };

        // Allow additional startDate filter only if it’s in the future
        if (startDate && new Date(startDate) > currentDate) {
          whereClauseObject.startDate = { gte: new Date(startDate) };
        }

        // Apply endDate filter if it’s also in the future
        if (endDate && new Date(endDate) > currentDate) {
          whereClauseObject.endDate = { lte: new Date(endDate) };
        }
        break;

      case EventType.MINE:
        // Apply base condition for events where the user is a participant
        whereClauseObject.lectures = {
          some: {
            participants: {
              some: {
                id: userId,
              },
            },
          },
        };
        // Allow unrestricted date filters for "mine" since no constraints on type
        if (startDate) {
          whereClauseObject.startDate = { gte: new Date(startDate) };
        }
        if (endDate) {
          whereClauseObject.endDate = { lte: new Date(endDate) };
        }
        break;
    }
  }
}
