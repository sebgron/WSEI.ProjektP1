import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EntranceCodeDto } from './create-access-config.dto';

export class UpdateAccessConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntranceCodeDto)
  @IsOptional()
  entranceCodes?: EntranceCodeDto[];

  @IsString()
  @IsOptional()
  generalInstructions?: string;
}
