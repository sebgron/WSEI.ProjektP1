"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatus = exports.TaskType = exports.RoomCondition = exports.ReservationStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["RECEPTION"] = "RECEPTION";
    UserRole["SERVICES"] = "SERVICES";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (exports.UserRole = UserRole = {}));
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "PENDING";
    ReservationStatus["CONFIRMED"] = "CONFIRMED";
    ReservationStatus["PREPARING"] = "PREPARING";
    ReservationStatus["READY"] = "READY";
    ReservationStatus["CHECKED_IN"] = "CHECKED_IN";
    ReservationStatus["CHECKED_OUT"] = "CHECKED_OUT";
    ReservationStatus["CANCELLED"] = "CANCELLED";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
var RoomCondition;
(function (RoomCondition) {
    RoomCondition["CLEAN"] = "CLEAN";
    RoomCondition["DIRTY"] = "DIRTY";
    RoomCondition["IN_MAINTENANCE"] = "MAINTENANCE";
})(RoomCondition || (exports.RoomCondition = RoomCondition = {}));
var TaskType;
(function (TaskType) {
    TaskType["CLEANING"] = "CLEANING";
    TaskType["REPAIR"] = "REPAIR";
    TaskType["AMENITY_REFILL"] = "REFILL";
})(TaskType || (exports.TaskType = TaskType = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["DONE"] = "DONE";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
//# sourceMappingURL=index.js.map