import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../enums';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
