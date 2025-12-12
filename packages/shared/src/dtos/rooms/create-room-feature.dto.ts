import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateRoomFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
