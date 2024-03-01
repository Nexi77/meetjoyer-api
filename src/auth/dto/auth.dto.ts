import {
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import { CustomMatchPasswords } from 'src/common/constraints/match_password.constraint';

export class AuthSignupDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @Validate(CustomMatchPasswords, ['password'])
  passwordConfirm: string;
}

export class AuthSignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
