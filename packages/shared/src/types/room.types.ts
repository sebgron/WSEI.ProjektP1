import { RoomCondition } from '../enums';

export interface IRoomResponse {
  id: number;
  number: string;
  condition: RoomCondition;
  additionalInfo?: string | null;
  category?: IRoomCategoryResponse;
  accessConfig?: IAccessConfigBasic;
}

export interface IRoomCategoryResponse {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  features?: IRoomFeatureResponse[];
}

export interface IRoomFeatureResponse {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface IAccessConfigBasic {
  id: number;
  name: string;
}
