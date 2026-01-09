import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GuestProfile } from '../../guests/entities/guest-profile.entity';
import { BookingRoom } from './booking-room.entity';
import { BookingStatus, PaymentStatus } from '@turborepo/shared';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bookingReference: string;

  @Column({ type: 'datetime' })
  checkInDate: Date;

  @Column({ type: 'datetime' })
  checkOutDate: Date;

  @Column({
    type: 'simple-enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({
    type: 'simple-enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'int' })
  nightsCount: number;

  @Column({ default: true })
  wantsDailyCleaning: boolean;

  // Relations
  @ManyToOne(() => GuestProfile, (guest) => guest.bookings)
  guest: GuestProfile;

  @OneToMany(() => BookingRoom, (bookingRoom) => bookingRoom.booking, {
    cascade: true,
  })
  bookingRooms: BookingRoom[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
