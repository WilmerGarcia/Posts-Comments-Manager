import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

jest.mock('bcrypt');

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword123',
  avatar: null,
  toObject: function () {
    return { ...this };
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const mockUserConstructor = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        ...mockUser,
        ...dto,
        toObject: () => ({ ...mockUser, ...dto }),
      }),
    }));

    Object.assign(mockUserConstructor, mockUserModel);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserConstructor },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    Object.assign(service['userModel'], mockUserModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.create(createUserDto, 'hashedPassword');

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'User',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.create(createUserDto, 'hashedPassword')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it('should return null when user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id without password', async () => {
      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      mockUserModel.findById.mockReturnValue(chainMock);

      const result = await service.findById(mockUser._id);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user not found', async () => {
      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockUserModel.findById.mockReturnValue(chainMock);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateDto };

      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedUser),
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue(chainMock);

      const result = await service.update(mockUser._id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when user not found', async () => {
      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue(chainMock);

      await expect(service.update('nonexistent', { name: 'Name' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password when current password is correct', async () => {
      const dto = { currentPassword: 'oldPassword', newPassword: 'newPassword' };
      const saveMock = jest.fn().mockResolvedValue(undefined);

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          save: saveMock,
        }),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await expect(service.updatePassword(mockUser._id, dto)).resolves.toBeUndefined();
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.currentPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.newPassword, 10);
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      const dto = { currentPassword: 'wrongPassword', newPassword: 'newPassword' };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.updatePassword(mockUser._id, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updatePassword('nonexistent', { currentPassword: 'a', newPassword: 'b' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toPublic', () => {
    it('should remove password from user object', () => {
      const result = service.toPublic(mockUser as any);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
    });
  });
});
