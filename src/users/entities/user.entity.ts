import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Task } from '../../tasks/entities/task.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    length: 255,
  })
  email!: string;

  @Column({
    name: 'password_hash',
    length: 255,
    select: false,
  })
  passwordHash!: string;


  @Column({
    name: 'password_reset_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  passwordResetTokenHash!: string | null;

  @Column({
    name: 'password_reset_expires_at',
    type: 'datetime',
    nullable: true,
  })
  passwordResetExpiresAt!: Date | null;


  @Column({
    name: 'first_name',
    length: 100,
  })
  firstName!: string;

  @Column({
    name: 'last_name',
    length: 100,
  })
  lastName!: string;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  avatarUrl!: string | null;

  @OneToMany(
    () => Task,
    (task) => task.user,
  )
  tasks!: Task[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}