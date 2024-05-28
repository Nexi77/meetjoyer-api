import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Param,
  ParseIntPipe,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import {
  GetCurrentUser,
  GetCurrentUserId,
  PublicRoute,
  Roles,
} from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role as UserRole } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { EventDto } from './dto/event.dto';
import { User } from 'src/user/dto/user.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('Events')
@Controller('events')
@UseGuards(RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANISER)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Cannot find lecutre with provided id' })
  @ApiCreatedResponse({
    description: 'The event has been successfully created.',
    type: CreateEventDto,
  })
  @HttpCode(HttpStatus.CREATED)
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.eventsService.createEvent(createEventDto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Retrieved all events successfully',
    type: [Event],
  })
  async getAllEvents(): Promise<EventDto[]> {
    return this.eventsService.getAllEvents();
  }

  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiOkResponse({
    description: 'Event retrieved successfully',
    type: EventDto,
  })
  @Get(':id')
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  async getEventById(@Param('id', ParseIntPipe) id: number): Promise<EventDto> {
    return this.eventsService.getEventById(id);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiForbiddenResponse({
    description: 'You are not allowed to delete this event',
  })
  @ApiOkResponse({
    description: 'Event deleted successfully',
    type: String,
  })
  @Roles(UserRole.ADMIN, UserRole.ORGANISER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteEventById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: User,
  ): Promise<string> {
    if (user.roles.includes(UserRole.ORGANISER) && user.id !== id) {
      throw new ForbiddenException('You are not allowed to delete this event.');
    }
    return this.eventsService.deleteEventById(id);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiForbiddenResponse({
    description: 'You are not allowed to update this event',
  })
  @ApiOkResponse({ description: 'Event updated successfully', type: String })
  @Roles(UserRole.ADMIN, UserRole.ORGANISER)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @GetCurrentUser() user: User,
  ): Promise<string> {
    if (user.roles.includes(UserRole.ORGANISER) && user.id !== id) {
      throw new ForbiddenException('You are not allowed to delete this event.');
    }
    return this.eventsService.updateEvent(id, updateEventDto);
  }
}
