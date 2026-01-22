import { IsOptional, IsDateString, IsString, IsBoolean } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  nextCleaningRequiresTowels?: boolean;
}
