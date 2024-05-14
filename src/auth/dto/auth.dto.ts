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

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
    },
  )
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
