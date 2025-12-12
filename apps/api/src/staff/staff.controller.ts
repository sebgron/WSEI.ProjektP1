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
import { StaffService } from './staff.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '@turborepo/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll(@Query('position') position?: string) {
    return this.staffService.findAll(position);
  }

  @Get('positions')
  getPositions() {
    return this.staffService.getPositions();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.findById(id);
  }

  @Post()
  create(@Body() createDto: CreateEmployeeDto) {
    return this.staffService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    return this.staffService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.remove(id);
  }
}
