// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

export enum RoomCondition {
  CLEAN = 'CLEAN',
  DIRTY = 'DIRTY',
  IN_MAINTENANCE = 'MAINTENANCE',
}

export enum TaskType {
  CLEANING = 'CLEANING',
  CHECKOUT = 'CHECKOUT',
  REPAIR = 'REPAIR',
  AMENITY_REFILL = 'REFILL',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  URGENT = 'URGENT',     
  NORMAL = 'NORMAL',     
  LOW = 'LOW',           
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// Interfaces
export interface RoomFeatureDTO {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
}
