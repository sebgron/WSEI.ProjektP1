import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../../enums';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
