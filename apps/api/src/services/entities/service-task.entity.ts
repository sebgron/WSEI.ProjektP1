import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { EmployeeProfile } from '../../staff/entities/employee-profile.entity';
import { TaskStatus, TaskType } from '@turborepo/shared';

@Entity()
export class ServiceTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'simple-enum',
    enum: TaskType,
    default: TaskType.CLEANING
  })
  type: TaskType;

  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Room, (room) => room.tasks)
  room: Room;

  // Changed from User to EmployeeProfile - tasks are assigned to employees
  @ManyToOne(() => EmployeeProfile, { nullable: true })
  assignedTo: EmployeeProfile;

  @CreateDateColumn()
  createdAt: Date;
}