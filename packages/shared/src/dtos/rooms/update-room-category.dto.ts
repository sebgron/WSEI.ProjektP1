import { IsString, IsOptional, IsNumber, IsArray, Min } from 'class-validator';

export class UpdateRoomCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imagePath?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerNight?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  featureIds?: number[];
}
