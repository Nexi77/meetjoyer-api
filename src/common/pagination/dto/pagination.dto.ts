import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  page: string | number = '1';

  @IsOptional()
  limit: string | number = '10';

  get skip(): number {
    return (Number(this.page) - 1) * Number(this.limit);
  }
}
