import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ message: string; user: UserResponseDto }> {
    return await this.authService.login(loginDto);
  }
}
