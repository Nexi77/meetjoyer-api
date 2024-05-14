import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from 'src/auth/types/roles.types';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const roles = request.user.roles as string[];
    if (!roles || !roles.includes(Roles.ADMIN)) {
      throw new ForbiddenException('Access restricted to admins only.');
    }
    return true;
  }
}
