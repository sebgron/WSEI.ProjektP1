import { apiFetch } from './api';
import { IBookingResponse, IBookingAccessCodesResponse } from '@turborepo/shared';

export const guestAPI = {
  getMyBookings: async (): Promise<IBookingResponse[]> => {
    return apiFetch<IBookingResponse[]>('bookings/my');
  },

  getBookingDetails: async (id: string): Promise<IBookingResponse> => {
    return apiFetch<IBookingResponse>(`bookings/${id}`);
  },

  cancelBooking: async (id: string): Promise<IBookingResponse> => {
    return apiFetch<IBookingResponse>(`bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  getAccessCodes: async (id: string): Promise<IBookingAccessCodesResponse> => {
    return apiFetch<IBookingAccessCodesResponse>(`bookings/${id}/access-codes`);
  },

  updateProfile: async (data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    addressStreet?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  }) => {
    return apiFetch('guests/my', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};
