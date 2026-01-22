import { apiFetch } from './api';
import { IBookingResponse, IBookingAccessCodesResponse, TaskPriority, IServiceTaskResponse, IRoomCategoryResponse } from '@turborepo/shared';

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

  reportIssue: async (bookingId: string, data: {
    roomId: number;
    description: string;
    priority?: TaskPriority;
  }): Promise<IServiceTaskResponse> => {
    return apiFetch<IServiceTaskResponse>(`bookings/${bookingId}/report-issue`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
  },

  requestService: async (bookingId: string, type: string, description: string): Promise<IServiceTaskResponse> => {
     return apiFetch<IServiceTaskResponse>(`bookings/${bookingId}/request-service`, {
        method: 'POST',
        body: JSON.stringify({ type, description }),
     });
  },

  toggleDailyCleaning: async (bookingId: string, enabled: boolean): Promise<IBookingResponse> => {
     return apiFetch<IBookingResponse>(`bookings/${bookingId}/daily-cleaning`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
     });
  },

  payForBooking: async (bookingId: string): Promise<IBookingResponse> => {
     return apiFetch<IBookingResponse>(`bookings/${bookingId}/payment-status`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus: 'PAID' }),
     });
  },

  toggleNextCleaningRequiresTowels: async (bookingId: string, requested: boolean): Promise<IBookingResponse> => {
     return apiFetch<IBookingResponse>(`bookings/${bookingId}/towels`, {
        method: 'PATCH',
        body: JSON.stringify({ requested }),
     });
  },

  checkAvailability: async (params: { checkIn: string; checkOut: string; guestCount: number }) => {
    const query = new URLSearchParams({
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guestCount: params.guestCount.toString(),
    }).toString();
    return apiFetch<{ category: IRoomCategoryResponse; availableCount: number; maxCapacity: number }[]>(`rooms/available?${query}`);
  },

  createPublicBooking: async (data: any): Promise<IBookingResponse> => {
      return apiFetch<IBookingResponse>('bookings/public', {
          method: 'POST',
          body: JSON.stringify(data),
      });
  }
};

