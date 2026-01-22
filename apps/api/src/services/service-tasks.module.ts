import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTask } from './entities/service-task.entity';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../users/entities/user.entity';
import { EmployeeProfile } from '../staff/entities/employee-profile.entity';
import { ServiceTasksService } from './service-tasks.service';
import { ServiceTasksController } from './service-tasks.controller';

import { SchedulingService } from './scheduling.service';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceTask, Room, User, EmployeeProfile, Booking])],
  controllers: [ServiceTasksController],
  providers: [ServiceTasksService, SchedulingService],
  exports: [ServiceTasksService, SchedulingService],
})
export class ServiceTasksModule {}
