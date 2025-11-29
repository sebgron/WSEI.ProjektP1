import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { RoomCondition } from '@turborepo/shared';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsEnum(RoomCondition)
  @IsOptional()
  condition?: RoomCondition;

  @IsNumber()
  categoryId: number;
}