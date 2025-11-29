export declare enum UserRole {
    ADMIN = "ADMIN",
    RECEPTION = "RECEPTION",
    SERVICES = "SERVICES",
    CUSTOMER = "CUSTOMER"
}
export declare enum ReservationStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    CHECKED_IN = "CHECKED_IN",
    CHECKED_OUT = "CHECKED_OUT",
    CANCELLED = "CANCELLED"
}
export declare enum RoomCondition {
    CLEAN = "CLEAN",
    DIRTY = "DIRTY",
    IN_MAINTENANCE = "MAINTENANCE"
}
export declare enum TaskType {
    CLEANING = "CLEANING",
    REPAIR = "REPAIR",
    AMENITY_REFILL = "REFILL"
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
export interface RoomFeatureDTO {
    id: number;
    name: string;
    icon: string;
    isActive: boolean;
}
