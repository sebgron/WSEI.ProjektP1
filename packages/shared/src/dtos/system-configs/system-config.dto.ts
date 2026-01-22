
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum SystemConfigKey {
  CHECK_IN_TIME = 'CHECK_IN_TIME',
  CHECK_OUT_TIME = 'CHECK_OUT_TIME',
  TASK_GENERATION_TIME = 'TASK_GENERATION_TIME',
  ACCESS_CODE_GRACE_PERIOD_MINUTES = 'ACCESS_CODE_GRACE_PERIOD_MINUTES',
  // Future configs
  CURRENCY = 'CURRENCY',
  HOTEL_NAME = 'HOTEL_NAME',
}

export enum SystemConfigType {
    TIME = 'TIME',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN'
}

export class SystemConfigDto {
  @IsEnum(SystemConfigKey)
  key: SystemConfigKey;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SystemConfigType)
  type: SystemConfigType;
}
