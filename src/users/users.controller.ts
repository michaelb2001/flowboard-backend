import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.findMe(
      request.user.userId,
    );
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.updateMe(
      request.user.userId,
      updateUserDto,
    );
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.usersService.changePassword(
      request.user.userId,
      changePasswordDto,
    );
  }
}