import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { RoomCondition } from '../../enums';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsEnum(RoomCondition)
  @IsOptional()
  condition?: RoomCondition;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  accessConfigId?: number;
}
