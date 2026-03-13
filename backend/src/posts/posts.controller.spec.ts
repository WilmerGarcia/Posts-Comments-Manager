import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { POST_STATUS } from './post-status.enum';

const mockPost = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Post',
  body: 'Test body content',
  author: 'Test Author',
  status: POST_STATUS.CREADO,
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPostsService = {
  create: jest.fn(),
  createBulk: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: typeof mockPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto = { title: 'New Post', body: 'Body', author: 'Author' };
      mockPostsService.create.mockResolvedValue({ ...mockPost, ...createPostDto });

      const result = await controller.create(createPostDto);

      expect(postsService.create).toHaveBeenCalledWith(createPostDto);
      expect(result.title).toBe(createPostDto.title);
    });
  });

  describe('createBulk', () => {
    it('should create multiple posts', async () => {
      const posts = [
        { title: 'Post 1', body: 'Body 1', author: 'Author 1' },
        { title: 'Post 2', body: 'Body 2', author: 'Author 2' },
      ];
      mockPostsService.createBulk.mockResolvedValue(posts);

      const result = await controller.createBulk({ posts });

      expect(postsService.createBulk).toHaveBeenCalledWith(posts);
      expect(result).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const pagination = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [mockPost],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockPostsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(pagination);

      expect(postsService.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne(mockPost._id);

      expect(postsService.findOne).toHaveBeenCalledWith(mockPost._id);
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedPost = { ...mockPost, ...updateDto };
      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.update(mockPost._id, updateDto);

      expect(postsService.update).toHaveBeenCalledWith(mockPost._id, updateDto);
      expect(result.title).toBe(updateDto.title);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPostsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockPost._id);

      expect(postsService.remove).toHaveBeenCalledWith(mockPost._id);
    });
  });
});
