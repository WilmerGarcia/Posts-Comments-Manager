import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostsService, CreatePostDto, UpdatePostDto } from './posts.service';
import { environment } from '../../../../environments/environment';
import { Post, POST_STATUS } from '../../../models';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  const mockPost: Post = {
    _id: 'post123',
    title: 'Test Post',
    body: 'Test body content',
    author: 'Test Author',
    status: POST_STATUS.PUBLICADO,
    images: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockPaginatedResponse = {
    success: true,
    message: 'OK',
    data: {
      data: [mockPost],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostsService],
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPosts', () => {
    it('should fetch paginated posts', fakeAsync(() => {
      let result: any;

      service.getPosts(1, 10).subscribe((res) => {
        result = res;
      });

      const req = httpMock.expectOne((r) => r.url.includes('/posts'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(mockPaginatedResponse);

      tick(300);

      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    }));

    it('should use default pagination values', fakeAsync(() => {
      service.getPosts().subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/posts'));
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(mockPaginatedResponse);

      tick(300);
    }));
  });

  describe('getPost', () => {
    it('should fetch a single post by id', (done) => {
      const postId = 'post123';

      service.getPost(postId).subscribe({
        next: (post) => {
          expect(post._id).toBe(postId);
          expect(post.title).toBe('Test Post');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'OK', data: mockPost });
    });
  });

  describe('createPost', () => {
    it('should create a new post', (done) => {
      const dto: CreatePostDto = {
        title: 'New Post',
        body: 'New body content',
        author: 'Author',
      };

      service.createPost(dto).subscribe({
        next: (post) => {
          expect(post.title).toBe(dto.title);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ success: true, message: 'OK', data: { ...mockPost, ...dto } });
    });
  });

  describe('createPostBulk', () => {
    it('should create multiple posts', (done) => {
      const posts: CreatePostDto[] = [
        { title: 'Post 1', body: 'Body 1', author: 'Author 1' },
        { title: 'Post 2', body: 'Body 2', author: 'Author 2' },
      ];

      service.createPostBulk(posts).subscribe({
        next: (result) => {
          expect(result.length).toBe(2);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts/bulk`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ posts });
      req.flush({
        success: true,
        message: 'OK',
        data: posts.map((p, i) => ({ ...mockPost, ...p, _id: `post${i}` })),
      });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', (done) => {
      const postId = 'post123';
      const dto: UpdatePostDto = { title: 'Updated Title' };

      service.updatePost(postId, dto).subscribe({
        next: (post) => {
          expect(post.title).toBe('Updated Title');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush({ success: true, message: 'OK', data: { ...mockPost, ...dto } });
    });
  });

  describe('deletePost', () => {
    it('should delete a post', (done) => {
      const postId = 'post123';

      service.deletePost(postId).subscribe({
        next: () => done(),
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getComments', () => {
    it('should fetch comments for a post', (done) => {
      const postId = 'post123';
      const mockComment = {
        _id: 'comment123',
        postId,
        body: 'Test comment',
        name: 'Commenter',
        email: 'commenter@example.com',
      };

      service.getComments(postId, 1, 20).subscribe({
        next: (result) => {
          expect(result.items.length).toBe(1);
          expect(result.items[0].body).toBe('Test comment');
          done();
        },
      });

      const req = httpMock.expectOne((r) => r.url.includes('/comments'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('postId')).toBe(postId);
      req.flush({
        success: true,
        message: 'OK',
        data: { data: [mockComment], total: 1, page: 1, limit: 20 },
      });
    });
  });

  describe('createComment', () => {
    it('should create a new comment', (done) => {
      const dto = {
        postId: 'post123',
        name: 'User',
        email: 'user@example.com',
        body: 'New comment',
      };

      service.createComment(dto).subscribe({
        next: (comment) => {
          expect(comment.body).toBe(dto.body);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/comments`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'OK', data: { _id: 'comment123', ...dto } });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', (done) => {
      const commentId = 'comment123';

      service.deleteComment(commentId).subscribe({
        next: () => done(),
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/comments/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', (done) => {
      const commentId = 'comment123';
      const dto = { body: 'Updated comment' };

      service.updateComment(commentId, dto).subscribe({
        next: (comment) => {
          expect(comment.body).toBe('Updated comment');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/comments/${commentId}`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ success: true, message: 'OK', data: { _id: commentId, ...dto } });
    });
  });

  describe('uploadPostImages', () => {
    it('should upload images and return paths', (done) => {
      const files = [new File(['content'], 'image.jpg', { type: 'image/jpeg' })];

      service.uploadPostImages(files).subscribe({
        next: (paths) => {
          expect(paths).toEqual(['/uploads/image.jpg']);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/uploads/posts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ success: true, message: 'OK', data: ['/uploads/image.jpg'] });
    });
  });
});
