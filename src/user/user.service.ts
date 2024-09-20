/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionMessages } from 'src/common/validation/messages.validation.enum';
import { SafeUser } from './dto/safe-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { GetUsersDto } from './dto/get-users-dto';
import { getParsedPaginationAndRest } from 'src/common/utils/pagination-util';
import { PaginatedResource } from 'src/common/pagination/dto/paginated_resource.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updateUserFields: {
        email?: string;
        hash?: string;
        image?: string;
      } = {
        email: updateUserDto.email,
        image: updateUserDto.image,
      };
      if (updateUserDto.password) {
        updateUserFields.hash = await this.authService.hashData(
          updateUserDto.password,
        );
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserFields,
      });
      const safeUser = new SafeUser(updatedUser);
      return safeUser;
    } catch (ex) {
      console.log(ex);
      throw new ConflictException(ExceptionMessages.EmailExists);
    }
  }

  async deleteUser(id: number) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });
      const safeUser = new SafeUser(deletedUser);
      return safeUser;
    } catch (ex) {
      throw new NotFoundException(`User with ID: ${id} was not found`);
    }
  }

  async getAllUsers(getUsersDto: GetUsersDto) {
    const where: Record<string, any> = {};

    const { skip, limit, page, role, ...filters } =
      getParsedPaginationAndRest<GetUsersDto>(getUsersDto);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        where[key] = {
          contains: value,
          mode: 'insensitive',
        };
      }
    });
    if (role)
      where.roles = {
        has: role,
      };
    const [data, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
      }),
      this.prisma.user.count(),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    const users = data.map((user) => new SafeUser(user));
    return new PaginatedResource<SafeUser>(users, totalPages, page, limit);
  }

  async getSingleUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID: ${id} was not found`);
    }
    return new SafeUser(user);
  }
}
