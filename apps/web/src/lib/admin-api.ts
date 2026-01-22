import { apiFetch } from './api';
import {
  UserRole,
  BookingStatus,
  PaymentStatus,
  RoomCondition,
  TaskStatus,
  TaskType,
  // Response types from shared
  IUserResponse,
  IRoomResponse,
  IRoomCategoryResponse,
  IRoomFeatureResponse,
  IBookingResponse,
  IGuestProfileResponse,
  IEmployeeProfileResponse,
  IServiceTaskResponse,
  IAccessConfigResponse,
  IEntranceCode,
  SystemConfigKey,
  SystemConfigDto,
  UpdateSystemConfigDto,
} from '@turborepo/shared';

// Re-export types for convenience
export type User = IUserResponse;
export type Room = IRoomResponse;
export type RoomCategory = IRoomCategoryResponse;
export type RoomFeature = IRoomFeatureResponse;
export type Booking = IBookingResponse;
export type GuestProfile = IGuestProfileResponse;
export type EmployeeProfile = IEmployeeProfileResponse;
export type ServiceTask = IServiceTaskResponse;
export type AccessConfiguration = IAccessConfigResponse;

// ============= TRANSLATIONS =============

export const translations = {
  roles: {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.STAFF]: 'Pracownik',
    [UserRole.USER]: 'Użytkownik',
  },
  bookingStatus: {
    [BookingStatus.PENDING]: 'Oczekująca',
    [BookingStatus.CONFIRMED]: 'Potwierdzona',
    [BookingStatus.CANCELLED]: 'Anulowana',
    [BookingStatus.CHECKED_IN]: 'Zameldowana',
    [BookingStatus.COMPLETED]: 'Zakończona',
  },
  paymentStatus: {
    [PaymentStatus.UNPAID]: 'Nieopłacona',
    [PaymentStatus.PAID]: 'Opłacona',
  },
  roomCondition: {
    [RoomCondition.CLEAN]: 'Czysty',
    [RoomCondition.DIRTY]: 'Brudny',
    [RoomCondition.IN_MAINTENANCE]: 'W naprawie',
  },
  taskStatus: {
    [TaskStatus.PENDING]: 'Oczekujące',
    [TaskStatus.IN_PROGRESS]: 'W trakcie',
    [TaskStatus.DONE]: 'Zakończone',
  },
  taskType: {
    [TaskType.CLEANING]: 'Sprzątanie',
    [TaskType.CHECKOUT]: 'Sprzątanie końcowe',
    [TaskType.REPAIR]: 'Naprawa',
    [TaskType.AMENITY_REFILL]: 'Uzupełnienie',
  },
};

// ============= HELPER =============

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined);
  if (filtered.length === 0) return '';
  return '?' + filtered.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

// ============= USERS API =============

export const usersAPI = {
  findAll: async (role?: UserRole): Promise<User[]> => {
    const query = buildQueryString({ role });
    return apiFetch<User[]>(`users${query}`);
  },

  findById: async (id: string): Promise<User> => {
    return apiFetch<User>(`users/${id}`);
  },

  create: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: UserRole;
  }): Promise<User> => {
    return apiFetch<User>('users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
  }>): Promise<User> => {
    return apiFetch<User>(`users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`users/${id}`, { method: 'DELETE' });
  },
};

// ============= ROOMS API =============

export const roomsAPI = {
  findAll: async (condition?: RoomCondition, categoryId?: number): Promise<Room[]> => {
    const query = buildQueryString({ condition, categoryId });
    return apiFetch<Room[]>(`rooms${query}`);
  },

  findById: async (id: number): Promise<Room> => {
    return apiFetch<Room>(`rooms/${id}`);
  },

  create: async (data: {
    number: string;
    categoryId: number;
    condition?: RoomCondition;
    accessConfigId?: number;
  }): Promise<Room> => {
    return apiFetch<Room>('rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<{
    number: string;
    categoryId: number;
    condition: RoomCondition;
    accessConfigId: number | null;
  }>): Promise<Room> => {
    return apiFetch<Room>(`rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateCondition: async (id: number, condition: RoomCondition): Promise<Room> => {
    return apiFetch<Room>(`rooms/${id}/condition`, {
      method: 'PATCH',
      body: JSON.stringify({ condition }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch<void>(`rooms/${id}`, { method: 'DELETE' });
  },
};

// ============= ROOM CATEGORIES API =============

export const roomCategoriesAPI = {
  findAll: async (): Promise<RoomCategory[]> => {
    return apiFetch<RoomCategory[]>('rooms/categories');
  },

  findById: async (id: number): Promise<RoomCategory> => {
    return apiFetch<RoomCategory>(`rooms/categories/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    pricePerNight: number;
    capacity: number;
    imagePath?: string;
    featureIds?: number[];
  }): Promise<RoomCategory> => {
    return apiFetch<RoomCategory>('rooms/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<{
    name: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    imagePath: string;
    featureIds: number[];
  }>): Promise<RoomCategory> => {
    return apiFetch<RoomCategory>(`rooms/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch<void>(`rooms/categories/${id}`, { method: 'DELETE' });
  },
};

// ============= ROOM FEATURES API =============

export const roomFeaturesAPI = {
  findAll: async (activeOnly?: boolean): Promise<RoomFeature[]> => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return apiFetch<RoomFeature[]>(`room-features${query}`);
  },

  findById: async (id: number): Promise<RoomFeature> => {
    return apiFetch<RoomFeature>(`room-features/${id}`);
  },

  create: async (data: {
    name: string;
    icon: string;
    isActive?: boolean;
  }): Promise<RoomFeature> => {
    return apiFetch<RoomFeature>('room-features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<{
    name: string;
    icon: string;
    isActive: boolean;
  }>): Promise<RoomFeature> => {
    return apiFetch<RoomFeature>(`room-features/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch<void>(`room-features/${id}`, { method: 'DELETE' });
  },
};

// ============= GUESTS API =============

export const guestsAPI = {
  findAll: async (search?: string): Promise<GuestProfile[]> => {
    const query = buildQueryString({ search });
    return apiFetch<GuestProfile[]>(`guests${query}`);
  },

  findById: async (id: string): Promise<GuestProfile> => {
    return apiFetch<GuestProfile>(`guests/${id}`);
  },

  getBookingHistory: async (id: string): Promise<GuestProfile> => {
    return apiFetch<GuestProfile>(`guests/${id}/bookings`);
  },

  create: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  }): Promise<GuestProfile> => {
    return apiFetch<GuestProfile>('guests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }>): Promise<GuestProfile> => {
    return apiFetch<GuestProfile>(`guests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`guests/${id}`, { method: 'DELETE' });
  },
};

// ============= BOOKINGS API =============

export const bookingsAPI = {
  findAll: async (guestId?: string, status?: BookingStatus): Promise<Booking[]> => {
    const query = buildQueryString({ guestId, status });
    return apiFetch<Booking[]>(`bookings${query}`);
  },

  findById: async (id: string): Promise<Booking> => {
    return apiFetch<Booking>(`bookings/${id}`);
  },

  findByReference: async (reference: string): Promise<Booking> => {
    return apiFetch<Booking>(`bookings/reference/${reference}`);
  },

  create: async (data: {
    guestId: string;
    checkInDate: string;
    checkOutDate: string;
    roomIds: number[];
  }): Promise<Booking> => {
    return apiFetch<Booking>('bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    checkInDate: string;
    checkOutDate: string;
    specialRequests: string;
  }>): Promise<Booking> => {
    return apiFetch<Booking>(`bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
    return apiFetch<Booking>(`bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updatePaymentStatus: async (id: string, paymentStatus: PaymentStatus): Promise<Booking> => {
    return apiFetch<Booking>(`bookings/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
  },

  cancel: async (id: string): Promise<Booking> => {
    return apiFetch<Booking>(`bookings/${id}/cancel`, { method: 'PATCH' });
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`bookings/${id}`, { method: 'DELETE' });
  },
};

// ============= STAFF API =============

export const staffAPI = {
  findAll: async (position?: string): Promise<EmployeeProfile[]> => {
    const query = buildQueryString({ position });
    return apiFetch<EmployeeProfile[]>(`staff${query}`);
  },

  findById: async (id: string): Promise<EmployeeProfile> => {
    return apiFetch<EmployeeProfile>(`staff/${id}`);
  },

  getPositions: async (): Promise<string[]> => {
    return apiFetch<string[]>('staff/positions');
  },

  create: async (data: {
    firstName: string;
    lastName: string;
    position: string;
    username: string;
    password: string;
    role?: UserRole;
  }): Promise<EmployeeProfile> => {
    return apiFetch<EmployeeProfile>('staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    position: string;
    password: string;
  }>): Promise<EmployeeProfile> => {
    return apiFetch<EmployeeProfile>(`staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`staff/${id}`, { method: 'DELETE' });
  },
};

// ============= SERVICE TASKS API =============

export const serviceTasksAPI = {
  findAll: async (filters?: {
    roomId?: number;
    assignedToId?: string;
    status?: TaskStatus;
    type?: TaskType;
  }): Promise<ServiceTask[]> => {
    const query = buildQueryString(filters || {});
    return apiFetch<ServiceTask[]>(`service-tasks${query}`);
  },

  findById: async (id: number): Promise<ServiceTask> => {
    return apiFetch<ServiceTask>(`service-tasks/${id}`);
  },

  create: async (data: {
    roomId: number;
    type: TaskType;
    description?: string;
    status?: TaskStatus;
  }): Promise<ServiceTask> => {
    return apiFetch<ServiceTask>('service-tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<{
    type: TaskType;
    description: string;
    status: TaskStatus;
    newDoorCode?: string;
  }>): Promise<ServiceTask> => {
    return apiFetch<ServiceTask>(`service-tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: number, status: TaskStatus): Promise<ServiceTask> => {
    return apiFetch<ServiceTask>(`service-tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  assignWorker: async (id: number, userId: string): Promise<ServiceTask> => {
    return apiFetch<ServiceTask>(`service-tasks/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch<void>(`service-tasks/${id}`, { method: 'DELETE' });
  },
};

// ============= ACCESS CONFIGS API =============

export const accessConfigsAPI = {
  findAll: async (): Promise<AccessConfiguration[]> => {
    return apiFetch<AccessConfiguration[]>('access-configs');
  },

  findById: async (id: number): Promise<AccessConfiguration> => {
    return apiFetch<AccessConfiguration>(`access-configs/${id}`);
  },

  create: async (data: {
    name: string;
    entranceCodes?: IEntranceCode[];
    generalInstructions?: string;
  }): Promise<AccessConfiguration> => {
    return apiFetch<AccessConfiguration>('access-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<{
    name: string;
    entranceCodes: IEntranceCode[];
    generalInstructions: string;
  }>): Promise<AccessConfiguration> => {
    return apiFetch<AccessConfiguration>(`access-configs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch<void>(`access-configs/${id}`, { method: 'DELETE' });
  },
};

// ============= SYSTEM CONFIGS API =============

export const systemConfigsAPI = {
  findAll: async (): Promise<SystemConfigDto[]> => {
    return apiFetch<SystemConfigDto[]>('system-configs');
  },

  update: async (key: SystemConfigKey, data: UpdateSystemConfigDto): Promise<SystemConfigDto> => {
    return apiFetch<SystemConfigDto>(`system-configs/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
