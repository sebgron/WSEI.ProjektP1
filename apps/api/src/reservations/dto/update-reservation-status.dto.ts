import { IsEnum, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ReservationStatus } from '@turborepo/shared';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status: ReservationStatus;

  @IsDateString()
  @IsOptional()
  estimatedReadyTime?: string;
}
