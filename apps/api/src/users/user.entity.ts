import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { UserRole } from '@turborepo/shared';
import { Reservation } from '../reservations/reservation.entity';
import { ServiceTask } from '../services/service-task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role: UserRole;

  @OneToMany(() => Reservation, (res) => res.user)
  reservations: Reservation[];

  @OneToMany(() => ServiceTask, (task) => task.assignedTo)
  assignedTasks: ServiceTask[];

  @CreateDateColumn()
  createdAt: Date;
}