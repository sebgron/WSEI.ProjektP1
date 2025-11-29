import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskType, TaskStatus } from '@turborepo/shared';

export class CreateServiceTaskDto {
  @IsEnum(TaskType)
  @IsNotEmpty()
  type: TaskType;

  @IsNumber()
  @IsNotEmpty()
  roomId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}