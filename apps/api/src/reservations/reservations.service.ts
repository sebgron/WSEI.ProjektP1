import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Room } from '../rooms/entities/room.entity';
import { RoomCategory } from '../rooms/entities/room-category.entity';
import { User } from '../users/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ReservationStatus, RoomCondition } from '@turborepo/shared';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(RoomCategory)
    private categoriesRepository: Repository<RoomCategory>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(userId?: string, status?: ReservationStatus): Promise<Reservation[]> {
    const query = this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.category', 'category');

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    if (status) {
      query.andWhere('reservation.status = :status', { status });
    }

    query.orderBy('reservation.startDate', 'DESC');

    return query.getMany();
  }

  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['user', 'room', 'room.category'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async create(createDto: CreateReservationDto, requestUserId: string): Promise<Reservation> {
    const userId = createDto.userId || requestUserId;
    
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: createDto.roomCategoryId },
    });
    if (!category) {
      throw new NotFoundException(`Room category with ID ${createDto.roomCategoryId} not found`);
    }

    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Calculate total price
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * Number(category.pricePerNight);

    const reservation = this.reservationsRepository.create({
      startDate,
      endDate,
      totalPrice,
      status: ReservationStatus.PENDING,
      notes: createDto.notes,
      user,
    });

    return this.reservationsRepository.save(reservation);
  }

  async update(id: string, updateDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findById(id);

    if (updateDto.startDate) {
      reservation.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      reservation.endDate = new Date(updateDto.endDate);
    }
    if (updateDto.notes !== undefined) {
      reservation.notes = updateDto.notes;
    }

    if (reservation.startDate >= reservation.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.reservationsRepository.save(reservation);
  }

  async updateStatus(id: string, statusDto: UpdateReservationStatusDto): Promise<Reservation> {
    const reservation = await this.findById(id);
    reservation.status = statusDto.status;

    if (statusDto.estimatedReadyTime) {
      reservation.estimatedReadyTime = new Date(statusDto.estimatedReadyTime);
    }

    return this.reservationsRepository.save(reservation);
  }

  async assignRoom(reservationId: string, roomId: number): Promise<Reservation> {
    const reservation = await this.findById(reservationId);
    
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['category'],
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Check if room is available (clean)
    if (room.condition !== RoomCondition.CLEAN) {
      throw new BadRequestException(`Room ${room.number} is not ready (current condition: ${room.condition})`);
    }

    reservation.room = room;
    return this.reservationsRepository.save(reservation);
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findById(id);
    await this.reservationsRepository.remove(reservation);
  }

  async checkAvailability(
    categoryId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ available: boolean; availableRooms: number }> {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
      relations: ['physicalRooms'],
    });
    if (!category) {
      throw new NotFoundException(`Room category with ID ${categoryId} not found`);
    }

    const totalRooms = category.physicalRooms.length;

    // Find overlapping reservations
    const overlapping = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.room', 'room')
      .where('room.categoryId = :categoryId', { categoryId })
      .andWhere('reservation.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [ReservationStatus.CANCELLED, ReservationStatus.CHECKED_OUT],
      })
      .andWhere(
        '(reservation.startDate <= :endDate AND reservation.endDate >= :startDate)',
        { startDate, endDate },
      )
      .getMany();

    const availableRooms = totalRooms - overlapping.length;

    return {
      available: availableRooms > 0,
      availableRooms,
    };
  }
}
