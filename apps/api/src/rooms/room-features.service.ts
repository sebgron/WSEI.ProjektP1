import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomFeature } from './entities/room-feature.entity';
import { CreateRoomFeatureDto } from './dto/create-room-feature.dto';
import { UpdateRoomFeatureDto } from './dto/update-room-feature.dto';

@Injectable()
export class RoomFeaturesService {
  constructor(
    @InjectRepository(RoomFeature)
    private featuresRepository: Repository<RoomFeature>,
  ) {}

  async findAll(activeOnly: boolean = false): Promise<RoomFeature[]> {
    if (activeOnly) {
      return this.featuresRepository.find({ where: { isActive: true } });
    }
    return this.featuresRepository.find();
  }

  async findById(id: number): Promise<RoomFeature> {
    const feature = await this.featuresRepository.findOne({ where: { id } });
    if (!feature) {
      throw new NotFoundException(`Room feature with ID ${id} not found`);
    }
    return feature;
  }

  async create(createDto: CreateRoomFeatureDto): Promise<RoomFeature> {
    const feature = this.featuresRepository.create(createDto);
    return this.featuresRepository.save(feature);
  }

  async update(id: number, updateDto: UpdateRoomFeatureDto): Promise<RoomFeature> {
    const feature = await this.findById(id);
    Object.assign(feature, updateDto);
    return this.featuresRepository.save(feature);
  }

  async remove(id: number): Promise<void> {
    const feature = await this.findById(id);
    await this.featuresRepository.remove(feature);
  }
}
