import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity('tasks')
@Index(['userId'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 150,
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({
    type: 'int',
    default: 0,
  })
  position!: number;

  @ManyToOne(
  () => User,
    (user) => user.tasks,
  {
    onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user!: User;

  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 36,
  })
  userId!: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}