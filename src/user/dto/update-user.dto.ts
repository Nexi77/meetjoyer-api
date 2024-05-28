import {
  IsEmail,
  IsOptional,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import { CustomMatchPasswords } from 'src/common/constraints/match_password.constraint';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password?: string;

  @IsOptional()
  @Validate(CustomMatchPasswords, ['password'])
  passwordConfirm?: string;
}
