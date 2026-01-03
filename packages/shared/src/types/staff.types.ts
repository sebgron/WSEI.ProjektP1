import { IUserResponse } from './user.types';

export interface IEmployeeProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  user?: IUserResponse;
  createdAt: string;
}
