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
  ReportIssueDto,
  BookingStatus,
  PublicBookingDto,
} from '@turborepo/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('guestId') guestId?: string,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.findAll(guestId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Request() req) {
    return this.bookingsService.findAll(req.user.guestProfileId);
  }

  @Get('reference/:reference')
  findByReference(@Param('reference') reference: string) {
    return this.bookingsService.findByReference(reference);
  }
  
  @Get('reference/:reference/public')
  findByReferencePublic(@Param('reference') reference: string) {
      return this.bookingsService.findByReference(reference);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/access-codes')
  getAccessCodes(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.getAccessCodes(id);
  }

  @Post('public')
  createPublic(@Body() createBookingDto: PublicBookingDto) {
    return this.bookingsService.createPublic(createBookingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createDto, req.user.guestProfileId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report-issue')
  reportIssue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReportIssueDto,
  ) {
    return this.bookingsService.reportIssue(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, statusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentDto: UpdatePaymentStatusDto,
  ) {
    return this.bookingsService.updatePaymentStatus(id, paymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.cancel(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.remove(id);
  }
}

