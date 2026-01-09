import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingRoom } from './entities/booking-room.entity';
import { Room } from '../rooms/entities/room.entity';
import { GuestProfile } from '../guests/entities/guest-profile.entity';
import { ServiceTask } from '../services/entities/service-task.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingRoom, Room, GuestProfile, ServiceTask])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

