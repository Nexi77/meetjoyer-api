import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
