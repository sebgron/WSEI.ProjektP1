import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { RoomCategory } from './room-category.entity';
import { Reservation } from '../../reservations/reservation.entity';
import { ServiceTask } from '../../services/service-task.entity';
import { RoomCondition } from '@turborepo/shared';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column({
    type: 'simple-enum',
    enum: RoomCondition,
    default: RoomCondition.CLEAN
  })
  condition: RoomCondition;

  @ManyToOne(() => RoomCategory, (category) => category.physicalRooms)
  category: RoomCategory;

  @OneToMany(() => Reservation, (res) => res.room)
  reservations: Reservation[];

  @OneToMany(() => ServiceTask, (task) => task.room)
  tasks: ServiceTask[];
}