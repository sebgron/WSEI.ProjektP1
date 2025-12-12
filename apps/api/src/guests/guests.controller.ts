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
  ParseUUIDPipe,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestProfileDto, UpdateGuestProfileDto } from '@turborepo/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.guestsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestsService.findById(id);
  }

  @Get(':id/bookings')
  getBookingHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestsService.getBookingHistory(id);
  }

  @Post()
  create(@Body() createDto: CreateGuestProfileDto) {
    return this.guestsService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateGuestProfileDto,
  ) {
    return this.guestsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestsService.remove(id);
  }
}
