import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

const mockComment = {
  _id: '507f1f77bcf86cd799439011',
  postId: '507f1f77bcf86cd799439022',
  body: 'Test comment',
  name: 'Test User',
  email: 'test@example.com',
};

const mockCommentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPostId: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: typeof mockCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findComments', () => {
    it('should return all comments when no postId provided', async () => {
      const paginatedResponse = {
        data: [mockComment],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockCommentsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findComments({ page: 1, limit: 10 });

      expect(commentsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(paginatedResponse);
    });

    it('should return comments for a specific post when postId provided', async () => {
      const postId = '507f1f77bcf86cd799439022';
      const paginatedResponse = {
        data: [mockComment],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockCommentsService.findByPostId.mockResolvedValue(paginatedResponse);

      const result = await controller.findComments({ postId, page: 1, limit: 10 });

      expect(commentsService.findByPostId).toHaveBeenCalledWith(postId, { page: 1, limit: 10 });
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto = {
        postId: '507f1f77bcf86cd799439022',
        body: 'New comment',
        name: 'User',
        email: 'user@example.com',
      };
      mockCommentsService.create.mockResolvedValue({ ...mockComment, ...createCommentDto });

      const result = await controller.create(createCommentDto);

      expect(commentsService.create).toHaveBeenCalledWith(createCommentDto);
      expect(result.body).toBe(createCommentDto.body);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateDto = { body: 'Updated body' };
      const updatedComment = { ...mockComment, ...updateDto };
      mockCommentsService.update.mockResolvedValue(updatedComment);

      const result = await controller.update(mockComment._id, updateDto);

      expect(commentsService.update).toHaveBeenCalledWith(mockComment._id, updateDto);
      expect(result.body).toBe(updateDto.body);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockCommentsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockComment._id);

      expect(commentsService.remove).toHaveBeenCalledWith(mockComment._id);
    });
  });
});
