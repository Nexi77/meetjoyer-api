import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class SafeUser {
  @ApiProperty({ description: 'The ID of the user' })
  id: number;

  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({
    description: 'The roles of the user',
    isArray: true,
    enum: Role,
  })
  roles: Role[];

  constructor(partial: Partial<SafeUser>) {
    Object.assign(this, {
      id: partial.id,
      email: partial.email,
      roles: partial.roles,
    });
  }
}
