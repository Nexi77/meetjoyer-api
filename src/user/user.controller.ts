import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { GetCurrentUser, GetCurrentUserId } from 'src/common/decorators';
import { Role as UserRole } from '@prisma/client';
import { Roles as RolesDec } from 'src/common/decorators/roles.decorator';
import { AuthService } from 'src/auth/auth.service';
import { AuthSignupDto } from 'src/auth/dto';
import { Tokens } from 'src/auth/types';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SafeUser } from './dto/safe-user.dto';
import { User } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOkResponse({ description: 'User updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async updateUser(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SafeUser> {
    if (id !== userId && !user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenException('You are not allowed to update this user.');
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  @Get()
  @RolesDec(UserRole.ADMIN)
  @ApiOkResponse({ description: 'List of all users.', type: [User] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async getAllUsers(): Promise<SafeUser[]> {
    return await this.userService.getAllUsers();
  }

  @Post('admin/create')
  @RolesDec(UserRole.ADMIN)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async createAdmin(@Body() dto: AuthSignupDto): Promise<Tokens> {
    return this.authService.signupLocal(dto, ['ADMIN']);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'User deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: User,
    @GetCurrentUserId() userId: number,
  ): Promise<void> {
    if (id !== userId && !user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenException('You are not allowed to delete this user.');
    }
    await this.userService.deleteUser(id);
  }
}
