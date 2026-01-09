import { TaskStatus, TaskType, TaskPriority } from '../enums';
import { IRoomResponse } from './room.types';
import { IEmployeeProfileBasic } from './user.types';

export interface IServiceTaskResponse {
  id: number;
  type: TaskType;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDate?: string;
  reportedByBookingId?: string;
  room: IRoomResponse;
  assignedTo?: IEmployeeProfileBasic;
  completedBy?: IEmployeeProfileBasic;
  createdAt: string;
}
