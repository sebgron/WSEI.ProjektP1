import { RoomCondition } from '../enums';
import { IAccessConfigResponse } from './access-config.types';

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
  pricePerNight: number;
  capacity: number;
  features?: IRoomFeatureResponse[];
}

export interface IRoomFeatureResponse {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface IRoomAccessCodesResponse {
  doorCode?: string;
  keyBoxCode?: string;
  accessConfig?: IAccessConfigResponse;
  entranceCodes?: { label: string; code: string }[];
  generalInstructions?: string;
}

export interface IAccessConfigBasic {
  id: number;
  name: string;
}
