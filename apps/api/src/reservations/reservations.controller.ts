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
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReservationStatus } from '@turborepo/shared';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    return this.reservationsService.findAll(userId, status);
  }

  @Get('my')
  findMy(@Request() req) {
    return this.reservationsService.findAll(req.user.id);
  }

  @Get('availability')
  checkAvailability(
    @Query('categoryId', ParseIntPipe) categoryId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reservationsService.checkAvailability(
      categoryId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findById(id);
  }

  @Post()
  create(@Body() createDto: CreateReservationDto, @Request() req) {
    return this.reservationsService.create(createDto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(id, statusDto);
  }

  @Patch(':id/assign-room')
  assignRoom(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.reservationsService.assignRoom(id, roomId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.remove(id);
  }
}
