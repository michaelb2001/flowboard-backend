import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const sslCa = configService.get<string>('DB_SSL_CA');

        return {
          type: 'mysql',

          host: configService.getOrThrow<string>('DB_HOST'),
          port: Number(configService.getOrThrow<string>('DB_PORT')),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_DATABASE'),

          ssl: {
            ca: sslCa ?? readFileSync(join(process.cwd(), 'ca.pem')),
          },

          autoLoadEntities: true,

          synchronize: false,
        };
      },
    }),

    UsersModule,
    AuthModule,
    TasksModule,
  ],
})
export class AppModule {}