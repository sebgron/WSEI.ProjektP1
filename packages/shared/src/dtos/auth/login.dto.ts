import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class GuestLoginDto {
  @IsString()
  bookingReference: string;

  @IsEmail()
  email: string;
}
