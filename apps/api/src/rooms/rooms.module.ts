import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomCategory } from './entities/room-category.entity';
import { RoomFeature } from './entities/room-feature.entity';
import { AccessConfiguration } from '../access-configs/entities/access-config.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomCategoriesService } from './room-categories.service';
import { RoomCategoriesController } from './room-categories.controller';
import { RoomFeaturesService } from './room-features.service';
import { RoomFeaturesController } from './room-features.controller';

import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomCategory, RoomFeature, AccessConfiguration, Booking])],
  controllers: [RoomCategoriesController,RoomsController, RoomFeaturesController],
  providers: [RoomsService, RoomCategoriesService, RoomFeaturesService],
  exports: [RoomsService, RoomCategoriesService, RoomFeaturesService],
})
export class RoomsModule {}
