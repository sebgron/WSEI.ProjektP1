import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoomFeaturesService } from './room-features.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomFeatureDto, UpdateRoomFeatureDto } from '@turborepo/shared';

@Controller('room-features')
@UseGuards(JwtAuthGuard)
export class RoomFeaturesController {
  constructor(private readonly featuresService: RoomFeaturesService) {}

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.featuresService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.featuresService.findById(id);
  }

  @Post()
  create(@Body() createDto: CreateRoomFeatureDto) {
    return this.featuresService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRoomFeatureDto,
  ) {
    return this.featuresService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.featuresService.remove(id);
  }
}
