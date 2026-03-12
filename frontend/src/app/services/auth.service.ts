import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthUser } from '../models';
import { environment } from '../../environments/environment.development';

interface AuthPayload {
  access_token: string;
  user: {
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

const STORAGE_KEY = 'pcm_auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadFromStorage(),
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get token(): string | null {
    return this.currentUser?.token ?? null;
  }

  login(dto: LoginDto) {
    return this.http
      .post<ApiSuccess<AuthPayload>>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(
        map((res) => res.data),
        tap((data) => {
          const user: AuthUser = {
            id: data.user._id,
            email: data.user.email,
            name: data.user.name,
            avatar: data.user.avatar,
            token: data.access_token,
          };
          this.currentUserSubject.next(user);
          this.saveToStorage(user);
        }),
      );
  }

  register(dto: RegisterDto) {
    return this.http
      .post<ApiSuccess<AuthPayload>>(`${environment.apiUrl}/auth/register`, dto)
      .pipe(
        map((res) => res.data),
        tap((data) => {
          const user: AuthUser = {
            id: data.user._id,
            email: data.user.email,
            name: data.user.name,
            avatar: data.user.avatar,
            token: data.access_token,
          };
          this.currentUserSubject.next(user);
          this.saveToStorage(user);
        }),
      );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private saveToStorage(user: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  getProfile() {
    return this.http
      .get<ApiSuccess<{ _id: string; email: string; name?: string; avatar?: string }>>(
        `${environment.apiUrl}/users`,
      )
      .pipe(
        map((res) => res.data),
        tap((data) => {
          const current = this.currentUser;
          if (!current) return;
          const updated: AuthUser = {
            ...current,
            id: data._id,
            email: data.email,
            name: data.name,
            avatar: data.avatar,
          };
          this.currentUserSubject.next(updated);
          this.saveToStorage(updated);
        }),
      );
  }

  updateProfile(dto: { name?: string; avatar?: string }) {
    return this.http
      .patch<ApiSuccess<{ _id: string; email: string; name?: string; avatar?: string }>>(
        `${environment.apiUrl}/users`,
        dto,
      )
      .pipe(
        map((res) => res.data),
        tap((data) => {
          const current = this.currentUser;
          if (!current) return;
          const updated: AuthUser = {
            ...current,
            id: data._id,
            email: data.email,
            name: data.name,
            avatar: data.avatar,
          };
          this.currentUserSubject.next(updated);
          this.saveToStorage(updated);
        }),
      );
  }

  changePassword(dto: { currentPassword: string; newPassword: string }) {
    return this.http.patch<ApiSuccess<void>>(
      `${environment.apiUrl}/users/password`,
      dto,
    );
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiSuccess<{ path: string }>>(
        `${environment.apiUrl}/uploads/avatar`,
        formData,
      )
      .pipe(map((res) => res.data));
  }
}


