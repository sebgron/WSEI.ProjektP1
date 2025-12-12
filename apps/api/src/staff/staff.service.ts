import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, UserRole } from '@turborepo/shared';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(EmployeeProfile)
    private employeeProfileRepository: Repository<EmployeeProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(position?: string): Promise<EmployeeProfile[]> {
    const query = this.employeeProfileRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user');

    if (position) {
      query.where('employee.position = :position', { position });
    }

    query.orderBy('employee.lastName', 'ASC').addOrderBy('employee.firstName', 'ASC');

    return query.getMany();
  }

  async findById(id: string): Promise<EmployeeProfile> {
    const employee = await this.employeeProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async findByUserId(userId: string): Promise<EmployeeProfile | null> {
    return this.employeeProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async create(createDto: CreateEmployeeDto): Promise<EmployeeProfile> {
    const existingUser = await this.userRepository.findOne({
      where: { username: createDto.username },
    });
    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const employeeProfile = this.employeeProfileRepository.create({
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      position: createDto.position,
    });
    const savedProfile = await this.employeeProfileRepository.save(employeeProfile);

    // Create user account linked to employee profile
    const user = this.userRepository.create({
      username: createDto.username,
      passwordHash: hashedPassword,
      role: createDto.role || UserRole.STAFF,
      employeeProfile: savedProfile,
    });
    await this.userRepository.save(user);

    return this.findById(savedProfile.id);
  }

  async update(id: string, updateDto: UpdateEmployeeDto): Promise<EmployeeProfile> {
    const employee = await this.findById(id);

    if (updateDto.firstName !== undefined) {
      employee.firstName = updateDto.firstName;
    }
    if (updateDto.lastName !== undefined) {
      employee.lastName = updateDto.lastName;
    }
    if (updateDto.position !== undefined) {
      employee.position = updateDto.position;
    }

    if (updateDto.password && employee.user) {
      employee.user.passwordHash = await bcrypt.hash(updateDto.password, 10);
      await this.userRepository.save(employee.user);
    }

    return this.employeeProfileRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findById(id);

    if (employee.user) {
      await this.userRepository.remove(employee.user);
    }

    await this.employeeProfileRepository.remove(employee);
  }

  async getPositions(): Promise<string[]> {
    const result = await this.employeeProfileRepository
      .createQueryBuilder('employee')
      .select('DISTINCT employee.position', 'position')
      .getRawMany();
    return result.map((r) => r.position);
  }
}
