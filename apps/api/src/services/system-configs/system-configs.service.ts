
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { SystemConfigKey, UpdateSystemConfigDto } from '@turborepo/shared';

@Injectable()
export class SystemConfigsService {
  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async findAll(): Promise<SystemConfig[]> {
    return this.systemConfigRepository.find();
  }

  async findByKey(key: SystemConfigKey): Promise<SystemConfig> {
    const config = await this.systemConfigRepository.findOne({ where: { key } });
    if (!config) {
      throw new NotFoundException(`Config with key ${key} not found`);
    }
    return config;
  }

  async update(key: SystemConfigKey, updateSystemConfigDto: UpdateSystemConfigDto): Promise<SystemConfig> {
    const config = await this.findByKey(key);
    config.value = updateSystemConfigDto.value;
    return this.systemConfigRepository.save(config);
  }

  // Helper to get value nicely typed if needed internally
  async getValue(key: SystemConfigKey): Promise<string> {
      const config = await this.findByKey(key);
      return config.value;
  }
}
