import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EntranceCodeDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class CreateAccessConfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntranceCodeDto)
  @IsOptional()
  entranceCodes?: EntranceCodeDto[];

  @IsString()
  @IsOptional()
  generalInstructions?: string;
}
