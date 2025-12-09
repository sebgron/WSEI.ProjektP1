import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomCategory } from './entities/room-category.entity';
import { AccessConfiguration } from '../access-configs/entities/access-config.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomCondition } from '@turborepo/shared';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(RoomCategory)
    private categoriesRepository: Repository<RoomCategory>,
    @InjectRepository(AccessConfiguration)
    private accessConfigRepository: Repository<AccessConfiguration>,
  ) {}

  async findAll(condition?: RoomCondition, categoryId?: number): Promise<Room[]> {
    const query = this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.category', 'category')
      .leftJoinAndSelect('room.accessConfig', 'accessConfig');

    if (condition) {
      query.andWhere('room.condition = :condition', { condition });
    }

    if (categoryId) {
      query.andWhere('room.category.id = :categoryId', { categoryId });
    }

    return query.getMany();
  }

  async findById(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['category', 'category.features', 'accessConfig'],
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async findByNumber(number: string): Promise<Room | null> {
    return this.roomsRepository.findOne({ where: { number } });
  }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const existingRoom = await this.findByNumber(createRoomDto.number);
    if (existingRoom) {
      throw new ConflictException(`Room with number ${createRoomDto.number} already exists`);
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: createRoomDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${createRoomDto.categoryId} not found`);
    }

    let accessConfig: AccessConfiguration | null = null;
    if (createRoomDto.accessConfigId) {
      accessConfig = await this.accessConfigRepository.findOne({
        where: { id: createRoomDto.accessConfigId },
      });
      if (!accessConfig) {
        throw new NotFoundException(`Access config with ID ${createRoomDto.accessConfigId} not found`);
      }
    }

    const room = this.roomsRepository.create({
      number: createRoomDto.number,
      condition: createRoomDto.condition || RoomCondition.CLEAN,
      category,
      accessConfig,
    });

    return this.roomsRepository.save(room);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findById(id);

    if (updateRoomDto.number && updateRoomDto.number !== room.number) {
      const existingRoom = await this.findByNumber(updateRoomDto.number);
      if (existingRoom) {
        throw new ConflictException(`Room with number ${updateRoomDto.number} already exists`);
      }
      room.number = updateRoomDto.number;
    }

    if (updateRoomDto.condition) {
      room.condition = updateRoomDto.condition;
    }

    if (updateRoomDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateRoomDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${updateRoomDto.categoryId} not found`);
      }
      room.category = category;
    }

    // Handle accessConfigId (can be set to null to remove config)
    if (updateRoomDto.accessConfigId !== undefined) {
      if (updateRoomDto.accessConfigId === null) {
        room.accessConfig = null;
      } else {
        const accessConfig = await this.accessConfigRepository.findOne({
          where: { id: updateRoomDto.accessConfigId },
        });
        if (!accessConfig) {
          throw new NotFoundException(`Access config with ID ${updateRoomDto.accessConfigId} not found`);
        }
        room.accessConfig = accessConfig;
      }
    }

    return this.roomsRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findById(id);
    await this.roomsRepository.remove(room);
  }

  async updateCondition(id: number, condition: RoomCondition): Promise<Room> {
    const room = await this.findById(id);
    room.condition = condition;
    return this.roomsRepository.save(room);
  }
}
