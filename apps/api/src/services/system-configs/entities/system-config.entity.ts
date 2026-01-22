
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { SystemConfigKey, SystemConfigType } from '@turborepo/shared';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryColumn({ type: 'text', unique: true })
  key: SystemConfigKey;

  @Column()
  value: string;

  @Column({ nullable: true })
  description: string;

  @Column({
      type: 'simple-enum',
      enum: SystemConfigType,
      default: SystemConfigType.STRING
  })
  type: SystemConfigType;
}
