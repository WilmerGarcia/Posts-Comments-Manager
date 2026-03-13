import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse = {
    success: true,
    message: 'OK',
    data: {
      access_token: 'test-jwt-token',
      user: {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      },
    },
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and store user', (done) => {
      const credentials = { email: 'test@example.com', password: 'password123' };

      service.login(credentials).subscribe({
        next: (data) => {
          expect(data.access_token).toBe('test-jwt-token');
          expect(service.isLoggedIn).toBe(true);
          expect(service.currentUser?.email).toBe('test@example.com');
          expect(service.token).toBe('test-jwt-token');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it('should save user to localStorage after login', (done) => {
      service.login({ email: 'test@example.com', password: 'pass' }).subscribe({
        next: () => {
          const stored = localStorage.getItem('pcm_auth');
          expect(stored).toBeTruthy();
          const parsed = JSON.parse(stored!);
          expect(parsed.email).toBe('test@example.com');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should send register request and store user', (done) => {
      const userData = { email: 'new@example.com', password: 'password123', name: 'New User' };

      service.register(userData).subscribe({
        next: () => {
          expect(service.isLoggedIn).toBe(true);
          expect(service.currentUser?.email).toBe('test@example.com');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should clear user and localStorage', (done) => {
      service.login({ email: 'test@example.com', password: 'pass' }).subscribe({
        next: () => {
          expect(service.isLoggedIn).toBe(true);

          service.logout();

          expect(service.isLoggedIn).toBe(false);
          expect(service.currentUser).toBeNull();
          expect(service.token).toBeNull();
          expect(localStorage.getItem('pcm_auth')).toBeNull();
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', (done) => {
      service.login({ email: 'test@example.com', password: 'pass' }).subscribe({
        next: () => {
          service.getProfile().subscribe({
            next: (data) => {
              expect(data.email).toBe('updated@example.com');
              done();
            },
          });

          const profileReq = httpMock.expectOne(`${environment.apiUrl}/users`);
          profileReq.flush({
            success: true,
            message: 'OK',
            data: { _id: 'user123', email: 'updated@example.com', name: 'Updated' },
          });
        },
      });

      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      loginReq.flush(mockAuthResponse);
    });
  });

});
