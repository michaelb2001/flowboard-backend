import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';

import { StringValue } from 'ms';

@Module({
  imports: [
    ConfigModule,

    UsersModule,
    MailModule,

    JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],

    useFactory: (configService: ConfigService) => ({
    secret: configService.getOrThrow<string>('JWT_SECRET'),

      expiresIn: configService.getOrThrow<StringValue>(
        'JWT_ACCESS_EXPIRES_IN',
      ),
    }),
    }),
    ],

  controllers: [AuthController],
  providers: [JwtStrategy,AuthService],
})
export class AuthModule {}