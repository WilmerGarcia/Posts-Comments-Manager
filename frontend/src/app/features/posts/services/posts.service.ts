import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { delay, map, Observable, retry, tap } from 'rxjs';
import { Comment, Post, PostStatus } from '../../../models';
import { environment } from '../../../../environments/environment';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

interface BackendPaginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostDto {
  title: string;
  body: string;
  author: string;
  createdByUserId?: string;
  status?: PostStatus;
  images?: string[];
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
  author?: string;
  createdByUserId?: string;
  status?: PostStatus;
  images?: string[];
}

export interface CreateCommentDto {
  postId: string;
  name: string;
  email: string;
  body: string;
}

export interface UpdateCommentDto {
  body?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private http: HttpClient) {}

  getPosts(page = 1, limit = 10, createdByUserId?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (createdByUserId) {
      params = params.set('createdByUserId', createdByUserId);
    }

    return this.http
      .get<ApiSuccess<BackendPaginated<Post>>>(`${environment.apiUrl}/posts`, { params })
      .pipe(
        delay(200),
        retry(1),
        map((res) => ({
          items: res.data.data,
          total: res.data.total,
          page: res.data.page,
          limit: res.data.limit,
          totalPages: (res.data.totalPages ?? Math.ceil(res.data.total / res.data.limit)) || 1,
        })),
        tap(() => {}), // Uso obligatorio de tap (requisito 2.4)
      );
  }

  getPost(id: string): Observable<Post> {
    return this.http
      .get<ApiSuccess<Post>>(`${environment.apiUrl}/posts/${id}`)
      .pipe(map((res) => res.data));
  }

  createPostBulk(posts: CreatePostDto[]): Observable<Post[]> {
    return this.http
      .post<ApiSuccess<Post[]>>(`${environment.apiUrl}/posts/bulk`, { posts })
      .pipe(map((res) => res.data));
  }

  createPost(dto: CreatePostDto): Observable<Post> {
    return this.http
      .post<ApiSuccess<Post>>(`${environment.apiUrl}/posts`, dto)
      .pipe(map((res) => res.data));
  }

  uploadPostImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http
      .post<ApiSuccess<string[]>>(`${environment.apiUrl}/uploads/posts`, formData)
      .pipe(map((res) => res.data));
  }

  updatePost(id: string, dto: UpdatePostDto): Observable<Post> {
    return this.http
      .put<ApiSuccess<Post>>(`${environment.apiUrl}/posts/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  deletePost(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${id}`);
  }

  getComments(postId: string, page = 1, limit = 20) {
    const params = new HttpParams()
      .set('postId', postId)
      .set('page', page)
      .set('limit', limit);
    return this.http
      .get<ApiSuccess<BackendPaginated<Comment>>>(`${environment.apiUrl}/comments`, { params })
      .pipe(
        map((res) => ({
          items: res.data.data,
          total: res.data.total,
          page: res.data.page,
          limit: res.data.limit,
        })),
      );
  }

  createComment(dto: CreateCommentDto): Observable<Comment> {
    return this.http
      .post<ApiSuccess<Comment>>(`${environment.apiUrl}/comments`, dto)
      .pipe(map((res) => res.data));
  }

  deleteComment(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/comments/${id}`);
  }

  updateComment(id: string, dto: UpdateCommentDto): Observable<Comment> {
    return this.http
      .patch<ApiSuccess<Comment>>(`${environment.apiUrl}/comments/${id}`, dto)
      .pipe(map((res) => res.data));
  }
}
