import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingRoom } from './entities/booking-room.entity';
import { Room } from '../rooms/entities/room.entity';
import { GuestProfile } from '../guests/entities/guest-profile.entity';
import { ServiceTask } from '../services/entities/service-task.entity';
import {
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  UpdatePaymentStatusDto,
  ReportIssueDto,
  BookingStatus,
  PaymentStatus,
  TaskType,
  TaskPriority,
  TaskStatus,
  PublicBookingDto,
} from '@turborepo/shared';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(BookingRoom)
    private bookingRoomsRepository: Repository<BookingRoom>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(GuestProfile)
    private guestProfileRepository: Repository<GuestProfile>,
    @InjectRepository(ServiceTask)
    private serviceTaskRepository: Repository<ServiceTask>,
  ) {}

  private generateBookingReference(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 4; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  async findAll(
    guestId?: string,
    status?: BookingStatus,
  ): Promise<Booking[]> {
    const query = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.guest', 'guest')
      .leftJoinAndSelect('booking.bookingRooms', 'bookingRooms')
      .leftJoinAndSelect('bookingRooms.room', 'room')
      .leftJoinAndSelect('room.category', 'category');

    if (guestId) {
      query.andWhere('guest.id = :guestId', { guestId });
    }

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    query.orderBy('booking.checkInDate', 'DESC');

    return query.getMany();
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['guest', 'bookingRooms', 'bookingRooms.room', 'bookingRooms.room.category'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async findByReference(reference: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingReference: reference },
      relations: ['guest', 'bookingRooms', 'bookingRooms.room', 'bookingRooms.room.category'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with reference ${reference} not found`);
    }
    return booking;
  }

  async createPublic(dto: PublicBookingDto) {
    let guest = await this.guestProfileRepository.findOne({
      where: { email: dto.guest.email },
    });

    if (!guest) {
      guest = this.guestProfileRepository.create({
        firstName: dto.guest.firstName,
        lastName: dto.guest.lastName,
        email: dto.guest.email,
        phoneNumber: dto.guest.phoneNumber,
        addressStreet: dto.guest.addressStreet,
        city: dto.guest.city,
        zipCode: dto.guest.zipCode,
        country: dto.guest.country,
      });
      guest = await this.guestProfileRepository.save(guest);
    }

    const booking = this.bookingsRepository.create({
      bookingReference: this.generateBookingReference(),
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      guest,
      nightsCount: Math.ceil((new Date(dto.checkOutDate).getTime() - new Date(dto.checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
      totalPrice: dto.totalPrice,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    if (dto.roomSelection) {
        for (const [categoryIdStr, count] of Object.entries(dto.roomSelection)) {
           const categoryId = Number(categoryIdStr);
           const rooms = await this.roomsRepository.createQueryBuilder('room')
             .where('room.categoryId = :categoryId', { categoryId })
             .getMany();
           
           let assigned = 0;
           for (const room of rooms) {
               if (assigned >= count) break;
                const bookingRoom = this.bookingRoomsRepository.create({
                 booking: savedBooking,
                 room: room,
                 pricePerNight: Number(room.category?.pricePerNight || 0)
               });
               await this.bookingRoomsRepository.save(bookingRoom);
               assigned++;
           }
        }
    }

    return savedBooking;
  }

  async create(
    createDto: CreateBookingDto,
    requestGuestId: string,
  ): Promise<Booking> {
    const guestId = createDto.guestId || requestGuestId;

    const guest = await this.guestProfileRepository.findOne({
      where: { id: guestId },
    });
    if (!guest) {
      throw new NotFoundException(`Guest profile with ID ${guestId} not found`);
    }

    const checkInDate = new Date(createDto.checkInDate);
    const checkOutDate = new Date(createDto.checkOutDate);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-in date must be before check-out date');
    }

    // Calculate nights
    const nightsCount = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Fetch rooms and calculate total price
    let totalPrice = 0;
    const bookingRooms: BookingRoom[] = [];

    for (const roomDto of createDto.rooms) {
      const room = await this.roomsRepository.findOne({
        where: { id: roomDto.roomId },
        relations: ['category'],
      });
      if (!room) {
        throw new NotFoundException(`Room with ID ${roomDto.roomId} not found`);
      }

      const pricePerNight = Number(room.category.pricePerNight);
      totalPrice += pricePerNight * nightsCount;

      const bookingRoom = this.bookingRoomsRepository.create({
        room,
        pricePerNight,
      });
      bookingRooms.push(bookingRoom);
    }

    // Generate unique booking reference
    let bookingReference: string;
    let isUnique = false;
    while (!isUnique) {
      bookingReference = this.generateBookingReference();
      const existing = await this.bookingsRepository.findOne({
        where: { bookingReference },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create booking
    const booking = this.bookingsRepository.create({
      bookingReference: bookingReference!,
      checkInDate,
      checkOutDate,
      nightsCount,
      totalPrice,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      guest,
      bookingRooms,
    });

    return this.bookingsRepository.save(booking);
  }

  async update(id: string, updateDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findById(id);

    if (updateDto.checkInDate) {
      booking.checkInDate = new Date(updateDto.checkInDate);
    }
    if (updateDto.checkOutDate) {
      booking.checkOutDate = new Date(updateDto.checkOutDate);
    }

    if (booking.checkInDate >= booking.checkOutDate) {
      throw new BadRequestException('Check-in date must be before check-out date');
    }

    // Recalculate nights if dates changed
    if (updateDto.checkInDate || updateDto.checkOutDate) {
      booking.nightsCount = Math.ceil(
        (booking.checkOutDate.getTime() - booking.checkInDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Recalculate total price
      let totalPrice = 0;
      for (const bookingRoom of booking.bookingRooms) {
        totalPrice += Number(bookingRoom.pricePerNight) * booking.nightsCount;
      }
      booking.totalPrice = totalPrice;
    }

    return this.bookingsRepository.save(booking);
  }

  async updateStatus(
    id: string,
    statusDto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.findById(id);
    booking.status = statusDto.status;
    return this.bookingsRepository.save(booking);
  }

  async updatePaymentStatus(
    id: string,
    paymentDto: UpdatePaymentStatusDto,
  ): Promise<Booking> {
    const booking = await this.findById(id);
    booking.paymentStatus = paymentDto.paymentStatus;
    return this.bookingsRepository.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findById(id);
    booking.status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findById(id);
    await this.bookingsRepository.remove(booking);
  }

  async getAccessCodes(id: string): Promise<{
    rooms: {
      roomNumber: string;
      doorCode: string | null;
      keyBoxCode: string | null;
      additionalInfo: string | null;
      // Shared access config data
      accessConfigName: string | null;
      entranceCodes: { label: string; code: string }[] | null;
      generalInstructions: string | null;
    }[];
  }> {
    const booking = await this.findById(id);

    // Only allow access codes for checked-in or confirmed bookings
    if (
      booking.status !== BookingStatus.CHECKED_IN &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Access codes are only available for confirmed or checked-in bookings',
      );
    }

    // Payment must be completed
    if (booking.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException(
        'Access codes are only available after payment is completed',
      );
    }

    const rooms = await Promise.all(
      booking.bookingRooms.map(async (br) => {
        // Load room with accessConfig relation and include sensitive fields
        const room = await this.roomsRepository
          .createQueryBuilder('room')
          .addSelect('room.doorCode')
          .addSelect('room.keyBoxCode')
          .leftJoinAndSelect('room.accessConfig', 'accessConfig')
          .addSelect('accessConfig.entranceCodes')
          .addSelect('accessConfig.generalInstructions')
          .where('room.id = :id', { id: br.room.id })
          .getOne();

        return {
          roomNumber: room?.number || '',
          doorCode: room?.doorCode || null,
          keyBoxCode: room?.keyBoxCode || null,
          additionalInfo: room?.additionalInfo || null,
          // Shared access config
          accessConfigName: room?.accessConfig?.name || null,
          entranceCodes: room?.accessConfig?.entranceCodes || null,
          generalInstructions: room?.accessConfig?.generalInstructions || null,
        };
      }),
    );

    return { rooms };
  }

  async reportIssue(bookingId: string, dto: ReportIssueDto): Promise<ServiceTask> {
    const booking = await this.findById(bookingId);

    // Verify the room belongs to this booking
    const bookingRoom = booking.bookingRooms.find(br => br.room.id === dto.roomId);
    if (!bookingRoom) {
      throw new BadRequestException('This room is not part of your booking');
    }

    const room = await this.roomsRepository.findOne({ where: { id: dto.roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Determine scheduled date based on priority
    const priority = dto.priority || TaskPriority.NORMAL;
    let scheduledDate: Date;

    if (priority === TaskPriority.URGENT) {
      scheduledDate = new Date(); // Today
    } else if (priority === TaskPriority.LOW) {
      scheduledDate = new Date(booking.checkOutDate); // After checkout
    } else {
      scheduledDate = new Date(); // Normal = today
    }

    const task = this.serviceTaskRepository.create({
      type: TaskType.REPAIR,
      status: TaskStatus.PENDING,
      priority,
      description: dto.description,
      scheduledDate,
      reportedByBookingId: bookingId,
      room,
    });

    return this.serviceTaskRepository.save(task);
  }
}
