import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PaginatedResource<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.hasNextPage = page * limit < total;
    this.hasPreviousPage = page > 1;
  }
}
