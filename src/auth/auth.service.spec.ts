import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: any;
    findByEmailWithPassword: any;
  };

  beforeEach(async () => {
    usersService = {
      create: vi.fn(),
      findByEmailWithPassword: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inexistente@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: hash,
        createdAt: new Date(),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user info on valid credentials', async () => {
      const hash = await bcrypt.hash('correctPassword', 10);
      const createdAt = new Date();
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: hash,
        createdAt,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'correctPassword',
      });

      expect(result).toEqual({
        message: 'Inicio de sesión exitoso',
        user: {
          id: 1,
          email: 'test@example.com',
          createdAt,
        },
      });
    });
  });
});
