/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeUser } from './types';
import { UpdateUserDto } from './dto/user.dto';
import { ExceptionMessages } from 'src/common/validation/messages.validation.enum';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<SafeUser> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      const { hash, hashedRt, ...rest } = updatedUser;
      return rest;
    } catch (ex) {
      throw new ConflictException(ExceptionMessages.EmailExists);
    }
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getAllUsers(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        roles: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
