import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiProperty({
    description: 'When user was created',
  })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'URL for user image' })
  image?: string | null;

  constructor(partial: Partial<SafeUser>) {
    Object.assign(this, {
      id: partial.id,
      email: partial.email,
      createdAt: partial.createdAt,
      roles: partial.roles,
      image: partial.image,
    });
  }
}
