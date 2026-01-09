import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceTask } from './entities/service-task.entity';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../users/entities/user.entity';
import { EmployeeProfile } from '../staff/entities/employee-profile.entity';
import {
  CreateServiceTaskDto,
  UpdateServiceTaskDto,
  UpdateTaskStatusDto,
  AssignTaskDto,
  TaskStatus,
  TaskType,
  RoomCondition,
  UserRole,
} from '@turborepo/shared';

@Injectable()
export class ServiceTasksService {
  constructor(
    @InjectRepository(ServiceTask)
    private tasksRepository: Repository<ServiceTask>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EmployeeProfile)
    private employeeProfileRepository: Repository<EmployeeProfile>,
  ) {}

  async findAll(
    roomId?: number,
    assignedToId?: string,
    status?: TaskStatus,
    type?: TaskType,
  ): Promise<ServiceTask[]> {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.room', 'room')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo');

    if (roomId) {
      query.andWhere('room.id = :roomId', { roomId });
    }

    if (assignedToId) {
      query.andWhere('assignedTo.id = :assignedToId', { assignedToId });
    }

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (type) {
      query.andWhere('task.type = :type', { type });
    }

    query.orderBy('task.createdAt', 'DESC');

    return query.getMany();
  }

  async findById(id: number): Promise<ServiceTask> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['room', 'assignedTo'],
    });
    if (!task) {
      throw new NotFoundException(`Service task with ID ${id} not found`);
    }
    return task;
  }

  async findMyTasks(userId: string): Promise<ServiceTask[]> {
    const employee = await this.employeeProfileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!employee) {
      throw new NotFoundException(`Employee profile for user ${userId} not found`);
    }

    return this.tasksRepository.find({
      where: [
        { assignedTo: { id: employee.id } }, 
        { assignedTo: { id: null } as any }, 
        { completedBy: { id: employee.id } }, 
      ] as any, 
      relations: ['room', 'assignedTo', 'completedBy'],
      order: {
        priority: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async create(createDto: CreateServiceTaskDto): Promise<ServiceTask> {
    const room = await this.roomsRepository.findOne({
      where: { id: createDto.roomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${createDto.roomId} not found`);
    }

    const task = this.tasksRepository.create({
      type: createDto.type,
      description: createDto.description,
      status: createDto.status || TaskStatus.PENDING,
      room,
    });

    if (createDto.type === TaskType.CLEANING) {
      room.condition = RoomCondition.DIRTY;
      await this.roomsRepository.save(room);
    }

    return this.tasksRepository.save(task);
  }

  async update(id: number, updateDto: UpdateServiceTaskDto): Promise<ServiceTask> {
    const task = await this.findById(id);
    
    if (updateDto.newDoorCode && updateDto.status === TaskStatus.DONE && task.type === TaskType.CHECKOUT) {
      const room = await this.roomsRepository.findOne({
        where: { id: task.room.id },
      });
      if (room) {
        room.doorCode = updateDto.newDoorCode;
        room.condition = RoomCondition.CLEAN;
        await this.roomsRepository.save(room);
        
        updateDto.status = TaskStatus.DONE;
      }
    }

    Object.assign(task, updateDto);
    return this.tasksRepository.save(task);
  }

  async updateStatus(id: number, status: TaskStatus, completedByUserId?: string): Promise<ServiceTask> {
    const task = await this.findById(id);
    task.status = status;

    if (status === TaskStatus.DONE && completedByUserId) {
       const employee = await this.employeeProfileRepository.findOne({
          where: { user: { id: completedByUserId } }
       });
       if (employee) {
          task.completedBy = employee;
       }
    } else if (status !== TaskStatus.DONE) {
       // If moved back from done, clear completedBy
       task.completedBy = null as unknown as EmployeeProfile;
    }

    // Both CLEANING and CHECKOUT mark room as clean
    if (status === TaskStatus.DONE && (task.type === TaskType.CLEANING || task.type === TaskType.CHECKOUT)) {
      const room = await this.roomsRepository.findOne({
        where: { id: task.room.id },
      });
      if (room) {
        room.condition = RoomCondition.CLEAN;
        await this.roomsRepository.save(room);
      }
    }

    return this.tasksRepository.save(task);
  }

  async assignWorker(taskId: number, userId: string): Promise<ServiceTask> {
    const task = await this.findById(taskId);

    // Find user and verify they have STAFF or ADMIN role
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['employeeProfile'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== UserRole.STAFF && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('User must have STAFF or ADMIN role to be assigned tasks');
    }

    if (!user.employeeProfile) {
      throw new BadRequestException('User must have an employee profile to be assigned tasks');
    }

    task.assignedTo = user.employeeProfile;
    return this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findById(id);
    await this.tasksRepository.remove(task);
  }
}
