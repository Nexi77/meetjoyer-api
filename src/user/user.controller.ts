import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { Role as UserRole } from '@prisma/client';
import { Roles as RolesDec } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SafeUser } from './dto/safe-user.dto';
import { SameUserOrAdmin } from 'src/common/guards/same_user_or_admin.guard';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(SameUserOrAdmin)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOkResponse({ description: 'User updated successfully.', type: SafeUser })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Get()
  @RolesDec(UserRole.ADMIN)
  @ApiOkResponse({ description: 'List of all users.', type: [SafeUser] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @UseGuards(SameUserOrAdmin)
  @Get(':id')
  @ApiOkResponse({ description: 'Single user', type: [SafeUser] })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async getSingleUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getSingleUser(id);
  }

  @UseGuards(SameUserOrAdmin)
  @Delete(':id')
  @ApiOkResponse({ description: 'User deleted successfully.', type: SafeUser })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
