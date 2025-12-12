import {
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BookingRoomDto {
  @IsNumber()
  @IsNotEmpty()
  roomId: number;
}

export class CreateBookingDto {
  @IsDateString()
  @IsNotEmpty()
  checkInDate: string;

  @IsDateString()
  @IsNotEmpty()
  checkOutDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingRoomDto)
  rooms: BookingRoomDto[];

  @IsUUID()
  @IsOptional()
  guestId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
