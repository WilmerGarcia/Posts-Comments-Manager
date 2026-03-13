import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword123',
};

const mockPublicUser = {
  id: mockUser._id,
  email: mockUser.email,
  name: mockUser.name,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toPublic: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue({
        _id: 'newUserId',
        email: createUserDto.email,
        name: createUserDto.name,
      } as any);

      const result = await service.register(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith(
        createUserDto,
        'hashedPassword',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'newUserId',
        email: createUserDto.email,
      });
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      usersService.findByEmail.mockResolvedValue(mockUser as any);
      usersService.toPublic.mockReturnValue(mockPublicUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user', mockPublicUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Email o contraseña incorrectos',
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongPassword' };

      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUserById', () => {
    it('should return user when found', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await service.validateUserById(mockUser._id);

      expect(usersService.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.validateUserById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
