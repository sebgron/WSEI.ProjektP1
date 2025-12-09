import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '@turborepo/shared';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}
