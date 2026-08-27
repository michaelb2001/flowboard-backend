import { BadRequestException ,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource , Repository } from 'typeorm';

import { Task, TaskStatus } from './entities/task.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';


@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    title: string,
    description?: string,
  ): Promise<Task> {
    const lastTask = await this.tasksRepository.findOne({
      where: {
        userId,
        status: TaskStatus.TODO,
      },
      order: {
        position: 'DESC',
      },
    });

    const position = lastTask
      ? lastTask.position + 1
      : 0;

    const task = this.tasksRepository.create({
      userId,
      title: title.trim(),
      description: description?.trim() || null,
      status: TaskStatus.TODO,
      position,
    });

    return this.tasksRepository.save(task);
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: {
        userId,
      },
      order: {
        position: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async findOne(
  id: string,
  userId: string,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task non trovata');
    }

    return task;
  }

  async update(
  id: string,
  userId: string,
  updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
        throw new NotFoundException('Task non trovata');
    }

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title.trim();
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description.trim();
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }

    if (updateTaskDto.position !== undefined) {
      task.position = updateTaskDto.position;
    }

    return this.tasksRepository.save(task);
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task non trovata');
    }

    const status = task.status;
    const deletedPosition = task.position;

    await this.tasksRepository.remove(task);

    await this.tasksRepository
      .createQueryBuilder()
      .update(Task)
      .set({
        position: () => 'position - 1',
      })
      .where('user_id = :userId', { userId })
      .andWhere('status = :status', { status })
      .andWhere('position > :position', {
        position: deletedPosition,
      })
      .execute();
  }

  async reorder(
    userId: string,
    reorderTasksDto: ReorderTasksDto,
  ): Promise<Task[]> {
    const {
      sourceStatus,
      sourceTaskIds,
      targetStatus,
      targetTaskIds,
    } = reorderTasksDto;

    if (
      sourceStatus === targetStatus &&
      sourceTaskIds.length !== targetTaskIds.length
    ) {
      throw new BadRequestException(
        'Gli elenchi delle task non sono coerenti',
      );
    }

    const allTaskIds = [
      ...new Set([
        ...sourceTaskIds,
        ...targetTaskIds,
      ]),
    ];

    const tasks = await this.tasksRepository.find({
      where: {
        userId,
      },
    });

    const taskMap = new Map(
      tasks.map((task) => [task.id, task]),
    );

    for (const taskId of allTaskIds) {
      if (!taskMap.has(taskId)) {
        throw new NotFoundException(
          `Task ${taskId} non trovata`,
        );
      }
    }

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const taskId of sourceTaskIds) {
        const task = taskMap.get(taskId)!;

        task.status = sourceStatus;
        task.position = sourceTaskIds.indexOf(taskId);
      }

      for (const taskId of targetTaskIds) {
        const task = taskMap.get(taskId)!;

        task.status = targetStatus;
        task.position = targetTaskIds.indexOf(taskId);
      }

      await queryRunner.manager.save(
        Task,
        allTaskIds.map(
          (taskId) => taskMap.get(taskId)!,
        ),
      );

      await queryRunner.commitTransaction();

      return this.findAll(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}