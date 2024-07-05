import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SameUserOrAdmin implements CanActivate {
  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const userId = Number(user['sub']) as number;
    const requestId = Number(request.params.id);
    if (requestId !== +userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'You are not allowed to access this resource.',
      );
    }
    return true;
  }
}
