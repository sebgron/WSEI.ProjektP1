import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Room } from '../../rooms/entities/room.entity';

export interface EntranceCode {
  label: string;
  code: string;
}

@Entity('access_configurations')
export class AccessConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: EntranceCode[] | null) => (value ? JSON.stringify(value) : null),
      from: (value: string | null) => (value ? JSON.parse(value) : null),
    },
  })
  @Exclude()
  entranceCodes: EntranceCode[] | null;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  generalInstructions: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Room, (room) => room.accessConfig)
  rooms: Room[];
}
