import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  level: string;

  @ManyToOne(() => User, (user) => user.courses, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @RelationId((course: Course) => course.createdBy)
  createdByUserId: number;
}