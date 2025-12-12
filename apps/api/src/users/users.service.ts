import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { GuestProfile } from '../guests/entities/guest-profile.entity';
import { EmployeeProfile } from '../staff/entities/employee-profile.entity';
import { CreateUserDto, UpdateUserDto, UserRole } from '@turborepo/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(GuestProfile)
    private guestProfileRepository: Repository<GuestProfile>,
    @InjectRepository(EmployeeProfile)
    private employeeProfileRepository: Repository<EmployeeProfile>,
  ) {}

  async findAll(role?: UserRole): Promise<User[]> {
    const query = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.guestProfile', 'guestProfile')
      .leftJoinAndSelect('user.employeeProfile', 'employeeProfile');
    
    if (role) {
      query.where('user.role = :role', { role });
    }
    
    return query.getMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['guestProfile', 'employeeProfile'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['guestProfile', 'employeeProfile'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['guestProfile', 'employeeProfile'],
    });
  }

  async createCustomer(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create guest profile
    const guestProfile = this.guestProfileRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      phoneNumber: createUserDto.phoneNumber,
    });
    const savedGuestProfile = await this.guestProfileRepository.save(guestProfile);

    // Create user
    const user = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      role: createUserDto.role || UserRole.USER,
      guestProfile: savedGuestProfile,
    });

    return this.usersRepository.save(user);
  }

  async createStaff(
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    position: string,
    role: UserRole = UserRole.STAFF,
  ): Promise<User> {
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('User with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee profile
    const employeeProfile = this.employeeProfileRepository.create({
      firstName,
      lastName,
      position,
    });
    const savedEmployeeProfile = await this.employeeProfileRepository.save(employeeProfile);

    // Create user
    const user = this.usersRepository.create({
      username,
      passwordHash: hashedPassword,
      role,
      employeeProfile: savedEmployeeProfile,
    });

    return this.usersRepository.save(user);
  }

  // Legacy create method - defaults to customer creation
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createCustomer(createUserDto);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Check email uniqueness
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      user.email = updateUserDto.email;
    }

    // Update password if provided
    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update role if provided
    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    // Update guest profile if exists
    if (user.guestProfile) {
      if (updateUserDto.firstName !== undefined) {
        user.guestProfile.firstName = updateUserDto.firstName;
      }
      if (updateUserDto.lastName !== undefined) {
        user.guestProfile.lastName = updateUserDto.lastName;
      }
      if (updateUserDto.phoneNumber !== undefined) {
        user.guestProfile.phoneNumber = updateUserDto.phoneNumber;
      }
      if (updateUserDto.email !== undefined) {
        user.guestProfile.email = updateUserDto.email;
      }
      await this.guestProfileRepository.save(user.guestProfile);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    
    // Remove associated profiles
    if (user.guestProfile) {
      await this.guestProfileRepository.remove(user.guestProfile);
    }
    if (user.employeeProfile) {
      await this.employeeProfileRepository.remove(user.employeeProfile);
    }
    
    await this.usersRepository.remove(user);
  }
}
