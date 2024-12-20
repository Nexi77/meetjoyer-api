import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

export class GetLecturesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  speakerEmail?: string;

  @IsOptional()
  @IsString()
  speakerId?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
