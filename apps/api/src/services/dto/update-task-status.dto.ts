import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '@turborepo/shared';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
