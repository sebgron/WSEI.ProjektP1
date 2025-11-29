import { IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateReservationDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  roomCategoryId?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
