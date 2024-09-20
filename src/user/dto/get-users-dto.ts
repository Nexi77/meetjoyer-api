import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';

export class GetUsersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
