export class User {
  id: number;
  email: string;
  roles: string[];
  updatedAt: Date;
  createdAt: Date;
  hash: string;
  hashedRt: string;
}

export class SafeUser {
  id: number;
  email: string;
  roles: string[];
  updatedAt: Date;
  createdAt: Date;
}
