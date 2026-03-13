import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockUser = {
  id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
};

const mockUsersService = {
  findById: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUser.id);

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser.id, updateDto);

      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result.name).toBe(updateDto.name);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const dto = { currentPassword: 'oldPass', newPassword: 'newPass' };
      mockUsersService.updatePassword.mockResolvedValue(undefined);

      await controller.changePassword(mockUser.id, dto);

      expect(usersService.updatePassword).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });
});
