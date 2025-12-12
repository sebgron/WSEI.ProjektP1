import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomDto, UpdateRoomDto, RoomCondition } from '@turborepo/shared';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(
    @Query('condition') condition?: RoomCondition,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.roomsService.findAll(
      condition,
      categoryId ? parseInt(categoryId, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findById(id);
  }

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Patch(':id/condition')
  updateCondition(
    @Param('id', ParseIntPipe) id: number,
    @Body('condition') condition: RoomCondition,
  ) {
    return this.roomsService.updateCondition(id, condition);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }
}
