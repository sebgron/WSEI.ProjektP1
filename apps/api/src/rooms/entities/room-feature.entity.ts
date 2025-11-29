import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RoomFeature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ default: true })
  isActive: boolean;
}