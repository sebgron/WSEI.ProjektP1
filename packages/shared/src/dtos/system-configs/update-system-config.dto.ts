
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
