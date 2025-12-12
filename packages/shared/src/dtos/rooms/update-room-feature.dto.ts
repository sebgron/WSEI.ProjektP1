import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateRoomFeatureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
