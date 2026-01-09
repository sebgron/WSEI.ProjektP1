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
import { CreateRoomDto, UpdateRoomDto, RoomCondition, SearchAvailabilityDto } from '@turborepo/shared';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}



  @Get('available')
  findAvailable(@Query() query: SearchAvailabilityDto) {
    return this.roomsService.findAvailable(
      query.checkIn,
      query.checkOut,
      query.guestCount,
    );
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/condition')
  updateCondition(
    @Param('id', ParseIntPipe) id: number,
    @Body('condition') condition: RoomCondition,
  ) {
    return this.roomsService.updateCondition(id, condition);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }
}
