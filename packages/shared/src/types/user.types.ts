import { UserRole } from '../enums';

export interface IUserResponse {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  createdAt: string;
  guestProfile?: IGuestProfileBasic;
  employeeProfile?: IEmployeeProfileBasic;
}

export interface IGuestProfileBasic {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface IEmployeeProfileBasic {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

export interface IAuthResponse {
  access_token: string;
  user: IUserResponse;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface IRegisterData extends ILoginData {
  firstName?: string;
  lastName?: string;
}
