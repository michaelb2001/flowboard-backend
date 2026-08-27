import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const { email, password, firstName, lastName } = createUserDto;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email già utilizzata');
    }

    const passwordHash = await argon2.hash(password);

    const user = this.usersRepository.create({
      email: normalizedEmail,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      avatarUrl: savedUser.avatarUrl,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async findMe(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Utente non trovato');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateMe(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Utente non trovato');
    }

    if (updateUserDto.email !== undefined) {
      const normalizedEmail =
        updateUserDto.email.trim().toLowerCase();

      const existingUser =
        await this.usersRepository.findOne({
          where: {
            email: normalizedEmail,
          },
        });

      if (
        existingUser &&
        existingUser.id !== user.id
      ) {
        throw new ConflictException(
          'Email già utilizzata',
        );
      }

      user.email = normalizedEmail;
    }

    if (updateUserDto.firstName !== undefined) {
      user.firstName =
        updateUserDto.firstName.trim();
    }

    if (updateUserDto.lastName !== undefined) {
      user.lastName =
        updateUserDto.lastName.trim();
    }

    if (updateUserDto.avatarUrl !== undefined) {
      user.avatarUrl =
        updateUserDto.avatarUrl;
    }

    const savedUser =
      await this.usersRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      avatarUrl: savedUser.avatarUrl,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Utente non trovato',
      );
    }

    const passwordValid = await argon2.verify(
      user.passwordHash,
      changePasswordDto.currentPassword,
    );

    if (!passwordValid) {
      throw new BadRequestException(
        'Password attuale non corretta',
      );
    }

    if (
      changePasswordDto.currentPassword ===
      changePasswordDto.newPassword
    ) {
      throw new BadRequestException(
        'La nuova password deve essere diversa dalla precedente',
      );
    }

    user.passwordHash = await argon2.hash(
      changePasswordDto.newPassword,
    );

    await this.usersRepository.save(user);
  }
}
