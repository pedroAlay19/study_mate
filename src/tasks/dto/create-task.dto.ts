import { IsString, IsNotEmpty, IsDateString, IsUUID, IsEnum } from 'class-validator';
import { TaskState, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  delivery_date: Date;

  @IsEnum(TaskPriority)
  @IsNotEmpty()
  priority: TaskPriority;

  @IsEnum(TaskState)
  @IsNotEmpty()
  state: TaskState;
}