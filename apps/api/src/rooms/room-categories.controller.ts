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
import { RoomCategoriesService } from './room-categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomCategoryDto, UpdateRoomCategoryDto } from '@turborepo/shared';

@Controller('rooms/categories')
@UseGuards(JwtAuthGuard)
export class RoomCategoriesController {
  constructor(private readonly categoriesService: RoomCategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findById(id);
  }

  @Post()
  create(@Body() createDto: CreateRoomCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRoomCategoryDto,
  ) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
