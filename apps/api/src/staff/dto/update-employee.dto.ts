import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
