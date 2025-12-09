import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GuestsModule } from './guests/guests.module';
import { StaffModule } from './staff/staff.module';
import { AccessConfigsModule } from './access-configs/access-configs.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { ServiceTasksModule } from './services/service-tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    GuestsModule,
    StaffModule,
    AccessConfigsModule,
    RoomsModule,
    BookingsModule,
    ServiceTasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
