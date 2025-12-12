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
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  UpdatePaymentStatusDto,
  BookingStatus,
  PaymentStatus,
} from '@turborepo/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(
    @Query('guestId') guestId?: string,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.findAll(guestId, status);
  }

  @Get('my')
  findMy(@Request() req) {
    return this.bookingsService.findAll(req.user.guestProfileId);
  }

  @Get('reference/:reference')
  findByReference(@Param('reference') reference: string) {
    return this.bookingsService.findByReference(reference);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findById(id);
  }

  @Get(':id/access-codes')
  getAccessCodes(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.getAccessCodes(id);
  }

  @Post()
  create(@Body() createDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createDto, req.user.guestProfileId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, statusDto);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentDto: UpdatePaymentStatusDto,
  ) {
    return this.bookingsService.updatePaymentStatus(id, paymentDto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.remove(id);
  }
}
