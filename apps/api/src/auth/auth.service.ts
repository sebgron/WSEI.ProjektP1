import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { GuestProfile } from '../guests/entities/guest-profile.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@turborepo/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(GuestProfile)
    private guestProfileRepository: Repository<GuestProfile>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'role'],
      relations: ['guestProfile'],
    });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      guestProfileId: user.guestProfile?.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.guestProfile?.firstName,
        lastName: user.guestProfile?.lastName,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create guest profile first
    const guestProfile = this.guestProfileRepository.create({
      firstName: registerDto.firstName || '',
      lastName: registerDto.lastName || '',
      email: registerDto.email,
    });
    const savedGuestProfile = await this.guestProfileRepository.save(guestProfile);

    // Create user with reference to guest profile
    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash: hashedPassword,
      role: UserRole.USER,
      guestProfile: savedGuestProfile,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      firstName: savedGuestProfile.firstName,
      lastName: savedGuestProfile.lastName,
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['guestProfile', 'employeeProfile'],
    });
  }
}
