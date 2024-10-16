import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EventType } from '../enums/event-type.enum';

export class GetEventsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(EventType, {
    message: 'type must be either ongoing, upcoming, or mine',
  })
  type?: EventType;
}
