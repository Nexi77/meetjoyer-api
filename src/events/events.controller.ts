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
  Query,
  Put,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { GetCurrentUserId, PublicRoute, Roles } from 'src/common/decorators';
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
} from '@nestjs/swagger';
import { EventDto } from './dto/event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiPaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { GetEventsDto } from './dto/get-events-dto';

@ApiTags('Events')
@Controller('events')
@UseGuards(RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Cannot find lecture with provided id' })
  @ApiCreatedResponse({
    description: 'The event has been successfully created.',
    type: EventDto,
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
  @ApiPaginatedResponse(EventDto)
  async getAllEvents(
    @Query() getEventsDto: GetEventsDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.eventsService.getAllEvents(getEventsDto, userId);
  }

  @Get('no-pagination')
  @ApiBearerAuth()
  @ApiPaginatedResponse(EventDto)
  async getAllEventsWithNoPagination() {
    return this.eventsService.getAllEventsWithNoPagination();
  }

  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiOkResponse({
    description: 'Event retrieved successfully',
    type: EventDto,
  })
  @Get(':id')
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  async getEventById(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventById(id);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiOkResponse({ description: 'Event updated successfully', type: EventDto })
  @Roles(UserRole.ADMIN, UserRole.ORGANISER)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiOkResponse({
    description: 'Event deleted successfully',
    type: EventDto,
  })
  @Roles(UserRole.ADMIN, UserRole.ORGANISER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteEventById(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteEventById(id);
  }
}
