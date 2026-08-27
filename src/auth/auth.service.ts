import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as argon2 from 'argon2';

import { randomBytes, createHash } from 'crypto';

import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

    async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email })
        .getOne();

    if (!user) {
        throw new UnauthorizedException('Credenziali non valide');
    }

    const passwordValid = await argon2.verify(
        user.passwordHash,
        password,
    );

    if (!passwordValid) {
        throw new UnauthorizedException('Credenziali non valide');
    }

    const payload = {
        sub: user.id,
        email: user.email,
    };

    return {
        access_token: await this.jwtService.signAsync(payload),
    };
    }

    async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
        where: {
        email,
        },
    });

    const message =
        'Se l’indirizzo email è associato a un account, riceverai le istruzioni per reimpostare la password.';

    if (!user) {
        return { message };
    }

    const resetToken = randomBytes(32).toString('hex');

    const resetTokenHash = createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const resetExpiresAt = new Date(
        Date.now() + 15 * 60 * 1000,
    );

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpiresAt = resetExpiresAt;

    await this.userRepository.save(user);

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw new Error('FRONTEND_URL non configurata');
    }

    const resetUrl =
        `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordResetEmail(
        user.email,
        resetUrl,
    );

    return { message };
    }

    async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const tokenHash = createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where(
        'user.password_reset_token_hash = :tokenHash',
        { tokenHash },
        )
        .getOne();

    if (!user) {
        throw new UnauthorizedException(
        'Token non valido o scaduto',
        );
    }

    if (
        !user.passwordResetExpiresAt ||
        user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
        throw new UnauthorizedException(
        'Token non valido o scaduto',
        );
    }

    user.passwordHash = await argon2.hash(
        newPassword,
    );

    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    await this.userRepository.save(user);

    return {
        message: 'Password reimpostata con successo.',
    };
    }
}