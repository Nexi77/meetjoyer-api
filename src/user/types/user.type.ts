import { Role } from '@prisma/client';

export class User {
  id: number;
  email: string;
  roles: Role[];
  updatedAt: Date;
  createdAt: Date;
  hash: string;
  hashedRt: string;
}

export class SafeUser {
  id: number;
  email: string;
  roles: Role[];
  updatedAt: Date;
  createdAt: Date;
}
