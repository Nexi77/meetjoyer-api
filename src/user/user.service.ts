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

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      const safeUser = new SafeUser(updatedUser);
      return safeUser;
    } catch (ex) {
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

  async getAllUsers() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => new SafeUser(user));
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
