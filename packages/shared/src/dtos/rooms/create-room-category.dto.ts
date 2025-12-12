import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateRoomCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsArray()
  @IsNumber({}, { each: true })
  featureIds: number[];
}
