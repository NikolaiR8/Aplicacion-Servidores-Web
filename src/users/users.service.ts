import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity.js';
import { UserRole } from './user-role.enum.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOneBy({
      email: dto.email.toLowerCase(),
    });
    if (existing) throw new ConflictException('Email is already registered');

    const user = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 12),
      role: UserRole.STUDENT,
    });
    await this.usersRepository.save(user);
    return this.loginResult(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOneBy({
      email: email.toLowerCase(),
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.loginResult(user);
  }

  async setRole(id: number, role: UserRole) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.role = role;
    return this.usersRepository.save(user);
  }

  private loginResult(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
