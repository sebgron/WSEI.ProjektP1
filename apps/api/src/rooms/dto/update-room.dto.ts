import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { RoomCondition } from '@turborepo/shared';

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
}
