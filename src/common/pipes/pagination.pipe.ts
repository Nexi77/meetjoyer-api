import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../pagination/dto/pagination.dto';
PaginationDto;

@Injectable()
export class PaginationPipe implements PipeTransform<any, PaginationDto> {
  transform(value: any): PaginationDto {
    const page = parseInt(value.page, 10) || 1;
    const limit = parseInt(value.limit, 10) || 10;

    if (page < 1 || limit < 1) {
      throw new BadRequestException(
        'Page and limit must be greater than or equal to 1.',
      );
    }

    const paginationDto = new PaginationDto();
    paginationDto.page = page;
    paginationDto.limit = limit;

    return paginationDto;
  }
}
