import { BookingStatus, PaymentStatus } from '../enums';
import { IGuestProfileBasic } from './user.types';
import { IRoomResponse } from './room.types';

export interface IBookingResponse {
  id: string;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  nightsCount: number;
  guest?: IGuestProfileBasic;
  bookingRooms?: IBookingRoomResponse[];
  createdAt: string;
  wantsDailyCleaning?: boolean;
}

export interface IBookingRoomResponse {
  id: string;
  room: IRoomResponse;
  pricePerNight: number;
}

export interface IBookingAccessCodesResponse {
  rooms: {
    roomNumber: string;
    doorCode: string | null;
    keyBoxCode: string | null;
    additionalInfo: string | null;
    accessConfigName: string | null;
    entranceCodes: { label: string; code: string }[] | null;
    generalInstructions: string | null;
  }[];
}
