import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestProfile } from './entities/guest-profile.entity';
import { CreateGuestProfileDto } from './dto/create-guest-profile.dto';
import { UpdateGuestProfileDto } from './dto/update-guest-profile.dto';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(GuestProfile)
    private guestProfileRepository: Repository<GuestProfile>,
  ) {}

  async findAll(search?: string): Promise<GuestProfile[]> {
    const query = this.guestProfileRepository
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.user', 'user')
      .leftJoinAndSelect('guest.bookings', 'bookings');

    if (search) {
      query.where(
        'guest.firstName LIKE :search OR guest.lastName LIKE :search OR guest.email LIKE :search',
        { search: `%${search}%` },
      );
    }

    query.orderBy('guest.lastName', 'ASC').addOrderBy('guest.firstName', 'ASC');

    return query.getMany();
  }

  async findById(id: string): Promise<GuestProfile> {
    const guest = await this.guestProfileRepository.findOne({
      where: { id },
      relations: ['user', 'bookings', 'bookings.bookingRooms', 'bookings.bookingRooms.room'],
    });
    if (!guest) {
      throw new NotFoundException(`Guest profile with ID ${id} not found`);
    }
    return guest;
  }

  async findByEmail(email: string): Promise<GuestProfile | null> {
    return this.guestProfileRepository.findOne({
      where: { email },
      relations: ['user'],
    });
  }

  async create(createDto: CreateGuestProfileDto): Promise<GuestProfile> {
    // Check if guest with this email already exists
    const existingGuest = await this.findByEmail(createDto.email);
    if (existingGuest) {
      throw new ConflictException('Guest with this email already exists');
    }

    const guest = this.guestProfileRepository.create(createDto);
    return this.guestProfileRepository.save(guest);
  }

  async update(
    id: string,
    updateDto: UpdateGuestProfileDto,
  ): Promise<GuestProfile> {
    const guest = await this.findById(id);

    // Check email uniqueness if changing email
    if (updateDto.email && updateDto.email !== guest.email) {
      const existingGuest = await this.findByEmail(updateDto.email);
      if (existingGuest) {
        throw new ConflictException('Guest with this email already exists');
      }
    }

    Object.assign(guest, updateDto);
    return this.guestProfileRepository.save(guest);
  }

  async remove(id: string): Promise<void> {
    const guest = await this.findById(id);
    await this.guestProfileRepository.remove(guest);
  }

  async getBookingHistory(id: string): Promise<GuestProfile> {
    const guest = await this.guestProfileRepository.findOne({
      where: { id },
      relations: [
        'bookings',
        'bookings.bookingRooms',
        'bookings.bookingRooms.room',
        'bookings.bookingRooms.room.category',
      ],
    });
    if (!guest) {
      throw new NotFoundException(`Guest profile with ID ${id} not found`);
    }
    return guest;
  }
}
