
import { IsString, IsEmail, IsOptional, ValidateNested, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class GuestDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  addressStreet: string;

  @IsString()
  city: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

export class PublicBookingDto {
  @ValidateNested()
  @Type(() => GuestDto)
  guest: GuestDto;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @IsNumber()
  @Min(1)
  guestCount: number;

  @IsNumber()
  @Min(1)
  totalPrice: number;

  @IsOptional() 
  roomSelection?: Record<number, number>; 
}
