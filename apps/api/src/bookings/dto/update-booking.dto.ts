import { IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
