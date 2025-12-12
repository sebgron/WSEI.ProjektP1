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
} from '@nestjs/common';
import { AccessConfigsService } from './access-configs.service';
import { CreateAccessConfigDto, UpdateAccessConfigDto } from '@turborepo/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('access-configs')
@UseGuards(JwtAuthGuard)
export class AccessConfigsController {
  constructor(private readonly accessConfigsService: AccessConfigsService) {}

  @Get()
  findAll() {
    return this.accessConfigsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accessConfigsService.findById(id);
  }

  @Post()
  create(@Body() createDto: CreateAccessConfigDto) {
    return this.accessConfigsService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAccessConfigDto,
  ) {
    return this.accessConfigsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accessConfigsService.remove(id);
  }
}
