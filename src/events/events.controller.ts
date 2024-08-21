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
  Patch,
  Query,
  UsePipes,
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
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { ApiPaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';

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
  @UsePipes(PaginationPipe)
  async getAllEvents(@Query() paginationDto: PaginationDto) {
    return this.eventsService.getAllEvents(paginationDto);
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
  @Patch(':id')
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
