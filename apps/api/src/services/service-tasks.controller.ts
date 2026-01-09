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
  ParseIntPipe,
} from '@nestjs/common';
import { ServiceTasksService } from './service-tasks.service';
import {
  CreateServiceTaskDto,
  UpdateServiceTaskDto,
  UpdateTaskStatusDto,
  AssignTaskDto,
  TaskStatus,
} from '@turborepo/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskType } from '@turborepo/shared';

@Controller('service-tasks')
@UseGuards(JwtAuthGuard)
export class ServiceTasksController {
  constructor(private readonly tasksService: ServiceTasksService) {}

  @Get()
  findAll(
    @Query('roomId') roomId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('status') status?: TaskStatus,
    @Query('type') type?: TaskType,
  ) {
    return this.tasksService.findAll(
      roomId ? parseInt(roomId, 10) : undefined,
      assignedToId,
      status,
      type,
    );
  }

  @Get('my')
  findMyTasks(@Request() req) {
    return this.tasksService.findMyTasks(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findById(id);
  }

  @Post()
  create(@Body() createDto: CreateServiceTaskDto) {
    return this.tasksService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateServiceTaskDto,
  ) {
    return this.tasksService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateTaskStatusDto,
    @Request() req,
  ) {
    return this.tasksService.updateStatus(id, statusDto.status, req.user?.id);
  }

  @Patch(':id/assign')
  assignWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignTaskDto,
  ) {
    return this.tasksService.assignWorker(id, assignDto.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
