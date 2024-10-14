import { ApiProperty } from '@nestjs/swagger';

export class SignInOutDto {
  @ApiProperty({ description: 'The ID of the lecture' })
  lectureId: number;
}
