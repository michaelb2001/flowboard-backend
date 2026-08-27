import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';

import { TaskStatus } from '../entities/task.entity';

export class ReorderTaskDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsInt()
  @Min(0)
  position!: number;

  @IsUUID('4', { each: true })
  taskIds!: string[];
}