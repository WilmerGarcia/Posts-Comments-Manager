import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './schemas/post.schema';
import { POST_STATUS } from './post-status.enum';

const mockPost = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Post',
  body: 'Test body content',
  author: 'Test Author',
  createdByUserId: 'user123',
  status: POST_STATUS.CREADO,
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPostsArray = [
  mockPost,
  { ...mockPost, _id: '507f1f77bcf86cd799439012', title: 'Second Post' },
  { ...mockPost, _id: '507f1f77bcf86cd799439013', title: 'Third Post' },
];

describe('PostsService', () => {
  let service: PostsService;
  let mockPostModel: any;

  beforeEach(async () => {
    mockPostModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      insertMany: jest.fn(),
    };

    const mockConstructor = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...mockPost, ...dto }),
    }));

    Object.assign(mockConstructor, mockPostModel);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: mockConstructor,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);

    Object.assign(service['postModel'], mockPostModel);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto = {
        title: 'New Post',
        body: 'New body',
        author: 'New Author',
      };

      const result = await service.create(createPostDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(createPostDto.title);
    });
  });

  describe('createBulk', () => {
    it('should create multiple posts at once', async () => {
      const posts = [
        { title: 'Post 1', body: 'Body 1', author: 'Author 1' },
        { title: 'Post 2', body: 'Body 2', author: 'Author 2' },
      ];

      mockPostModel.insertMany.mockResolvedValue(posts);

      const result = await service.createBulk(posts);

      expect(mockPostModel.insertMany).toHaveBeenCalledWith(posts);
      expect(result).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPostsArray),
      };

      mockPostModel.find.mockReturnValue(chainMock);
      mockPostModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPost),
      };

      mockPostModel.findById.mockReturnValue(chainMock);

      const result = await service.findOne(mockPost._id);

      expect(result).toEqual(mockPost);
      expect(mockPostModel.findById).toHaveBeenCalledWith(mockPost._id);
    });

    it('should throw NotFoundException when post not found', async () => {
      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockPostModel.findById.mockReturnValue(chainMock);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the post', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedPost = { ...mockPost, ...updateDto };

      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedPost),
      };

      mockPostModel.findByIdAndUpdate.mockReturnValue(chainMock);

      const result = await service.update(mockPost._id, updateDto);

      expect(result.title).toBe('Updated Title');
      expect(mockPostModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPost._id,
        updateDto,
        { new: true },
      );
    });

    it('should throw NotFoundException when updating non-existent post', async () => {
      const chainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockPostModel.findByIdAndUpdate.mockReturnValue(chainMock);

      await expect(
        service.update('nonexistent', { title: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPostModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPost),
      });

      await expect(service.remove(mockPost._id)).resolves.toBeUndefined();
      expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockPost._id,
      );
    });

    it('should throw NotFoundException when deleting non-existent post', async () => {
      mockPostModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
