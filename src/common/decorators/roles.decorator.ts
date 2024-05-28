import { SetMetadata } from '@nestjs/common';

// The 'roles' key is used to store metadata for the roles
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
