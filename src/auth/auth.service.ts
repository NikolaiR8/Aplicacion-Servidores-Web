import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginDto): Promise<{ message: string; user: UserResponseDto }> {
    const normalizedEmail = loginDto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmailWithPassword(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
