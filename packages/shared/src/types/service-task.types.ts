import { TaskStatus, TaskType } from '../enums';
import { IRoomResponse } from './room.types';
import { IEmployeeProfileBasic } from './user.types';

export interface IServiceTaskResponse {
  id: number;
  type: TaskType;
  description?: string;
  status: TaskStatus;
  room: IRoomResponse;
  assignedTo?: IEmployeeProfileBasic;
  createdAt: string;
}
