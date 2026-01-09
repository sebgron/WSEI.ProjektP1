import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskType, TaskStatus } from '../../enums';

export class UpdateServiceTaskDto {
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  newDoorCode?: string;
}
