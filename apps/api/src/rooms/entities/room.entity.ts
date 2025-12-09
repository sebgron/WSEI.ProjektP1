import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RoomCategory } from './room-category.entity';
import { AccessConfiguration } from '../../access-configs/entities/access-config.entity';
import { BookingRoom } from '../../bookings/entities/booking-room.entity';
import { ServiceTask } from '../../services/entities/service-task.entity';
import { RoomCondition } from '@turborepo/shared';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column({
    type: 'simple-enum',
    enum: RoomCondition,
    default: RoomCondition.CLEAN,
  })
  condition: RoomCondition;

  // Hidden till checkin
  @Column({ nullable: true })
  @Exclude()
  doorCode: string | null;

  @Column({ nullable: true })
  @Exclude()
  keyBoxCode: string | null;

  @Column({ type: 'text', nullable: true })
  additionalInfo: string | null;

  @ManyToOne(() => AccessConfiguration, (config) => config.rooms, { nullable: true })
  @JoinColumn()
  accessConfig: AccessConfiguration | null;

  @ManyToOne(() => RoomCategory, (category) => category.physicalRooms)
  category: RoomCategory;

  @OneToMany(() => BookingRoom, (bookingRoom) => bookingRoom.room)
  bookingRooms: BookingRoom[];

  @OneToMany(() => ServiceTask, (task) => task.room)
  tasks: ServiceTask[];
}