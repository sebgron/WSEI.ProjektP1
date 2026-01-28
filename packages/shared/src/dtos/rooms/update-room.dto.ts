import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { RoomCondition } from '../../enums';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  number?: string;

  @IsEnum(RoomCondition)
  @IsOptional()
  condition?: RoomCondition;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  accessConfigId?: number | null;

  @IsString()
  @IsOptional()
  doorCode?: string;
}
