import { IsNotEmpty, IsString } from 'class-validator';
import { SafeUser } from 'src/user/dto/safe-user.dto';

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  lectureId: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  user: SafeUser;
}
