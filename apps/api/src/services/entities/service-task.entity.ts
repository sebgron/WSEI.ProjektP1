import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { EmployeeProfile } from '../../staff/entities/employee-profile.entity';
import { TaskStatus, TaskType, TaskPriority } from '@turborepo/shared';

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

  @Column({
    type: 'simple-enum',
    enum: TaskPriority,
    default: TaskPriority.NORMAL
  })
  priority: TaskPriority;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ nullable: true })
  reportedByBookingId: string;

  @ManyToOne(() => Room, (room) => room.tasks)
  room: Room;

  // Changed from User to EmployeeProfile - tasks are assigned to employees
  @ManyToOne(() => EmployeeProfile, { nullable: true })
  assignedTo: EmployeeProfile;

  @ManyToOne(() => EmployeeProfile, { nullable: true })
  completedBy: EmployeeProfile;

  @CreateDateColumn()
  createdAt: Date;
}