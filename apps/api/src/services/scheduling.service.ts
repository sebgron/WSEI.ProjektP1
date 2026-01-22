
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { ServiceTask } from './entities/service-task.entity'; // Ideally should be in a shared location or imported relative
import { Room } from '../rooms/entities/room.entity';
import { BookingStatus, RoomCondition, TaskStatus, TaskType } from '@turborepo/shared';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(ServiceTask)
    private readonly taskRepository: Repository<ServiceTask>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  // Run every day at 10:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleDailyCleaningTasks() {
    this.logger.debug('Running daily cleaning task generation...');

    // Find all active bookings (Checked In)
    const activeBookings = await this.bookingRepository.find({
      where: { status: BookingStatus.CHECKED_IN },
      relations: ['bookingRooms', 'bookingRooms.room'],
    });

    for (const booking of activeBookings) {
      // Skip if guest opted out of daily cleaning
      if (!booking.wantsDailyCleaning) {
        continue;
      }

      for (const br of booking.bookingRooms) {
        const room = br.room;

        // Create cleaning task
        const description = booking.nextCleaningRequiresTowels
          ? 'Sprzątanie codzienne + WYMIANA RĘCZNIKÓW'
          : 'Sprzątanie codzienne';

        const task = this.taskRepository.create({
            type: TaskType.CLEANING,
            status: TaskStatus.PENDING,
            description: description,
            room: room,
            reportedByBookingId: booking.id
        });

        await this.taskRepository.save(task);

        // Update room condition
        room.condition = RoomCondition.DIRTY;
        await this.roomRepository.save(room);
      }

      // Reset the towel flag if it was set
      if (booking.nextCleaningRequiresTowels) {
        booking.nextCleaningRequiresTowels = false;
        await this.bookingRepository.save(booking);
      }
    }
    
    this.logger.debug(`Generated daily tasks for ${activeBookings.length} bookings.`);
  }
}
