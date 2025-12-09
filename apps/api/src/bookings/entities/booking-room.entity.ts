import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('booking_rooms')
export class BookingRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerNight: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingRooms, {
    onDelete: 'CASCADE',
  })
  booking: Booking;

  @ManyToOne(() => Room, (room) => room.bookingRooms)
  room: Room;
}
