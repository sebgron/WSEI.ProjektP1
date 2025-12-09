import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '@turborepo/shared';
import { GuestProfile } from '../../guests/entities/guest-profile.entity';
import { EmployeeProfile } from '../../staff/entities/employee-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ select: false })
  passwordHash: string;

  // Login for customers (email-based)
  @Column({ unique: true, nullable: true })
  email: string | null;

  // Login for staff (username-based)
  @Column({ unique: true, nullable: true })
  username: string | null;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // Relation to GuestProfile (nullable - not all users are guests)
  @OneToOne(() => GuestProfile, (guest) => guest.user, { nullable: true })
  @JoinColumn()
  guestProfile: GuestProfile | null;

  // Relation to EmployeeProfile (nullable - not all users are employees)
  @OneToOne(() => EmployeeProfile, (employee) => employee.user, { nullable: true })
  @JoinColumn()
  employeeProfile: EmployeeProfile | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
