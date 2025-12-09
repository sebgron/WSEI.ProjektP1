import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessConfiguration } from './entities/access-config.entity';
import { CreateAccessConfigDto } from './dto/create-access-config.dto';
import { UpdateAccessConfigDto } from './dto/update-access-config.dto';

@Injectable()
export class AccessConfigsService {
  constructor(
    @InjectRepository(AccessConfiguration)
    private accessConfigRepository: Repository<AccessConfiguration>,
  ) {}

  async findAll(): Promise<AccessConfiguration[]> {
    return this.accessConfigRepository.find({
      relations: ['rooms'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<AccessConfiguration> {
    const config = await this.accessConfigRepository.findOne({
      where: { id },
      relations: ['rooms'],
    });
    if (!config) {
      throw new NotFoundException(`Access configuration with ID ${id} not found`);
    }
    return config;
  }

  async findByIdWithSecrets(id: number): Promise<AccessConfiguration> {
    const config = await this.accessConfigRepository
      .createQueryBuilder('config')
      .addSelect('config.entranceCodes')
      .addSelect('config.generalInstructions')
      .leftJoinAndSelect('config.rooms', 'rooms')
      .where('config.id = :id', { id })
      .getOne();
    
    if (!config) {
      throw new NotFoundException(`Access configuration with ID ${id} not found`);
    }
    return config;
  }

  async create(createDto: CreateAccessConfigDto): Promise<AccessConfiguration> {
    const config = this.accessConfigRepository.create(createDto);
    return this.accessConfigRepository.save(config);
  }

  async update(id: number, updateDto: UpdateAccessConfigDto): Promise<AccessConfiguration> {
    const config = await this.findById(id);
    Object.assign(config, updateDto);
    return this.accessConfigRepository.save(config);
  }

  async remove(id: number): Promise<void> {
    const config = await this.findById(id);
    await this.accessConfigRepository.remove(config);
  }
}
