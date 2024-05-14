import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignInDto, AuthSignupDto } from './dto';
import { Tokens } from './types';
import { RtGuard } from 'src/common/guards';
import {
  GetCurrentUser,
  GetCurrentUserId,
  PublicRoute,
} from 'src/common/decorators';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiConflictResponse()
  @PublicRoute()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthSignupDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @ApiForbiddenResponse()
  @PublicRoute()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthSignInDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @PublicRoute()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetCurrentUser('refreshToken') rt: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.authService.refreshToken(userId, rt);
  }
}
