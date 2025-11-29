import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTask } from './service-task.entity';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../users/user.entity';
import { ServiceTasksService } from './service-tasks.service';
import { ServiceTasksController } from './service-tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceTask, Room, User])],
  controllers: [ServiceTasksController],
  providers: [ServiceTasksService],
  exports: [ServiceTasksService],
})
export class ServiceTasksModule {}
