import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.create(
      request.user.userId,
      createTaskDto.title,
      createTaskDto.description,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.findAll(
      request.user.userId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.findOne(
      id,
      request.user.userId,
    );
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(
    @Body() reorderTasksDto: ReorderTasksDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.reorder(
      request.user.userId,
      reorderTasksDto,
    );
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.update(
      id,
      request.user.userId,
      updateTaskDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.remove(
      id,
      request.user.userId,
    );
  }
}