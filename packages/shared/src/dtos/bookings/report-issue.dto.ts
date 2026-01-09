import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskPriority } from '../../enums';

export class ReportIssueDto {
  @IsNumber()
  @IsNotEmpty()
  roomId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
