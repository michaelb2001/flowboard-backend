import { IsArray, IsEnum, IsUUID } from 'class-validator';

import { TaskStatus } from '../entities/task.entity';

export class ReorderTasksDto {
  @IsEnum(TaskStatus)
  sourceStatus!: TaskStatus;

  @IsArray()
  @IsUUID('4', { each: true })
  sourceTaskIds!: string[];

  @IsEnum(TaskStatus)
  targetStatus!: TaskStatus;

  @IsArray()
  @IsUUID('4', { each: true })
  targetTaskIds!: string[];
}