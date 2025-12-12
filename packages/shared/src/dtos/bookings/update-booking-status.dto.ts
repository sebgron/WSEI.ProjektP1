import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '../../enums';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}
