import { IBookingResponse } from './booking.types';

export interface IGuestProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  addressStreet?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  bookings?: IBookingResponse[];
  createdAt: string;
}
