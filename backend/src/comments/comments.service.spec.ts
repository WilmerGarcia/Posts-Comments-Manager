import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentsService } from './comments.service';
import { Comment } from './schemas/comment.schema';
import { User } from '../users/schemas/user.schema';

const mockComment = {
  _id: '507f1f77bcf86cd799439011',
  postId: new Types.ObjectId('507f1f77bcf86cd799439022'),
  body: 'Test comment body',
  name: 'Commenter Name',
  email: 'commenter@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCommentsArray = [
  mockComment,
  { ...mockComment, _id: '507f1f77bcf86cd799439012', body: 'Second comment' },
];

describe('CommentsService', () => {
  let service: CommentsService;
  let mockCommentModel: any;
  let mockUserModel: any;

  beforeEach(async () => {
    mockCommentModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockUserModel = {
      find: jest.fn(),
    };

    const mockCommentConstructor = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        ...mockComment,
        ...dto,
        toObject: () => ({ ...mockComment, ...dto }),
      }),
    }));

    Object.assign(mockCommentConstructor, mockCommentModel);

    const mockUserFindChain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    mockUserModel.find.mockReturnValue(mockUserFindChain);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getModelToken(Comment.name), useValue: mockCommentConstructor },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    Object.assign(service['commentModel'], mockCommentModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createCommentDto = {
        postId: '507f1f77bcf86cd799439022',
        body: 'New comment',
        name: 'User Name',
        email: 'user@example.com',
      };

      const result = await service.create(createCommentDto);

      expect(result).toBeDefined();
      expect(result.body).toBe(createCommentDto.body);
    });
  });

  describe('findByPostId', () => {
    it('should return comments for a specific post', async () => {
      const postId = '507f1f77bcf86cd799439022';
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockComment]),
      };

      mockCommentModel.find.mockReturnValue(chainMock);
      mockCommentModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findByPostId(postId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockComment),
      };

      mockCommentModel.findById.mockReturnValue(chainMock);

      const result = await service.findOne(mockComment._id);

      expect(result).toBeDefined();
      expect(mockCommentModel.findById).toHaveBeenCalledWith(mockComment._id);
    });

    it('should throw NotFoundException when comment not found', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCommentModel.findById.mockReturnValue(chainMock);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the comment', async () => {
      const updateDto = { body: 'Updated body' };
      const updatedComment = { ...mockComment, ...updateDto };

      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedComment),
      };

      mockCommentModel.findByIdAndUpdate.mockReturnValue(chainMock);

      const result = await service.update(mockComment._id, updateDto);

      expect(result.body).toBe(updateDto.body);
    });

    it('should throw NotFoundException when updating non-existent comment', async () => {
      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCommentModel.findByIdAndUpdate.mockReturnValue(chainMock);

      await expect(service.update('nonexistent', { body: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockCommentModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockComment),
      });

      await expect(service.remove(mockComment._id)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when deleting non-existent comment', async () => {
      mockCommentModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
