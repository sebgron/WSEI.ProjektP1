import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoomCategory } from './entities/room-category.entity';
import { RoomFeature } from './entities/room-feature.entity';
import { CreateRoomCategoryDto } from './dto/create-room-category.dto';
import { UpdateRoomCategoryDto } from './dto/update-room-category.dto';

@Injectable()
export class RoomCategoriesService {
  constructor(
    @InjectRepository(RoomCategory)
    private categoriesRepository: Repository<RoomCategory>,
    @InjectRepository(RoomFeature)
    private featuresRepository: Repository<RoomFeature>,
  ) {}

  async findAll(): Promise<RoomCategory[]> {
    return this.categoriesRepository.find({
      relations: ['features', 'physicalRooms'],
    });
  }

  async findById(id: number): Promise<RoomCategory> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['features', 'physicalRooms'],
    });
    if (!category) {
      throw new NotFoundException(`Room category with ID ${id} not found`);
    }
    return category;
  }

  async create(createDto: CreateRoomCategoryDto): Promise<RoomCategory> {
    const features = await this.featuresRepository.findBy({
      id: In(createDto.featureIds),
    });

    const category = this.categoriesRepository.create({
      name: createDto.name,
      description: createDto.description,
      pricePerNight: createDto.pricePerNight,
      capacity: createDto.capacity,
      features,
    });

    return this.categoriesRepository.save(category);
  }

  async update(id: number, updateDto: UpdateRoomCategoryDto): Promise<RoomCategory> {
    const category = await this.findById(id);

    if (updateDto.name !== undefined) category.name = updateDto.name;
    if (updateDto.description !== undefined) category.description = updateDto.description;
    if (updateDto.pricePerNight !== undefined) category.pricePerNight = updateDto.pricePerNight;
    if (updateDto.capacity !== undefined) category.capacity = updateDto.capacity;

    if (updateDto.featureIds) {
      category.features = await this.featuresRepository.findBy({
        id: In(updateDto.featureIds),
      });
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findById(id);
    await this.categoriesRepository.remove(category);
  }
}
