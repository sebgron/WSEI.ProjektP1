import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { User } from '../users/entities/user.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeProfile, User]), RoomsModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
