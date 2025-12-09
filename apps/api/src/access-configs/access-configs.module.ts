import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessConfiguration } from './entities/access-config.entity';
import { AccessConfigsService } from './access-configs.service';
import { AccessConfigsController } from './access-configs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccessConfiguration])],
  controllers: [AccessConfigsController],
  providers: [AccessConfigsService],
  exports: [AccessConfigsService],
})
export class AccessConfigsModule {}
