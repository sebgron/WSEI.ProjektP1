import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { Room } from './room.entity';
import { RoomFeature } from './room-feature.entity';

@Entity()
export class RoomCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerNight: number;

  @Column()
  capacity: number;

  @OneToMany(() => Room, (room) => room.category)
  physicalRooms: Room[];

  @Column({ nullable: true })
  imagePath: string;

  @ManyToMany(() => RoomFeature)
  @JoinTable()
  features: RoomFeature[];
}