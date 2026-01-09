
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchAvailabilityDto {
  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  guestCount: number;
}
