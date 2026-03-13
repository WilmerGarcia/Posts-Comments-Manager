import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthPageComponent } from './auth-page.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

describe('AuthPageComponent', () => {
  let component: AuthPageComponent;
  let fixture: ComponentFixture<AuthPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [AuthPageComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should have invalid form when empty', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should require email', () => {
      const email = component.form.controls.email;
      expect(email.valid).toBeFalsy();
      expect(email.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const email = component.form.controls.email;
      email.setValue('invalid-email');
      expect(email.errors?.['email']).toBeTruthy();

      email.setValue('valid@example.com');
      expect(email.errors).toBeNull();
    });

    it('should require password', () => {
      const password = component.form.controls.password;
      expect(password.valid).toBeFalsy();
      expect(password.errors?.['required']).toBeTruthy();
    });

    it('should require password minimum length of 6', () => {
      const password = component.form.controls.password;
      password.setValue('12345');
      expect(password.errors?.['minlength']).toBeTruthy();

      password.setValue('123456');
      expect(password.errors).toBeNull();
    });

    it('should have valid form with correct data', () => {
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('switchMode', () => {
    it('should switch from login to register', () => {
      expect(component.mode).toBe('login');

      component.switchMode('register');

      expect(component.mode).toBe('register');
    });

    it('should reset form and error when switching', () => {
      component.form.patchValue({ email: 'test@example.com', password: '123456' });
      component.error = 'Some error';

      component.switchMode('register');

      expect(component.form.value.email).toBe('');
      expect(component.error).toBeNull();
    });

    it('should do nothing when switching to same mode', () => {
      component.form.patchValue({ email: 'test@example.com' });

      component.switchMode('login');

      expect(component.form.value.email).toBe('test@example.com');
    });
  });

  describe('submit - login', () => {
    beforeEach(() => {
      component.mode = 'login';
    });

    it('should not submit if form is invalid', () => {
      component.submit();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched if invalid', () => {
      spyOn(component.form, 'markAllAsTouched');

      component.submit();

      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should call login service with correct data', fakeAsync(() => {
      authServiceSpy.login.and.returnValue(of({ access_token: 'token', user: {} } as any));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.submit();
      tick();

      expect(authServiceSpy.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    }));

    it('should show loading state during login', fakeAsync(() => {
      authServiceSpy.login.and.returnValue(of({ access_token: 'token', user: {} } as any));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(component.loading).toBeFalse();

      component.submit();

      tick();

      expect(component.loading).toBeFalse();
    }));

    it('should navigate to posts on successful login', fakeAsync(() => {
      authServiceSpy.login.and.returnValue(of({ access_token: 'token', user: {} } as any));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.submit();
      tick();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/posts');
      expect(toastServiceSpy.success).toHaveBeenCalled();
    }));

    it('should handle login error', fakeAsync(() => {
      const errorResponse = { error: { message: 'Credenciales inválidas' } };
      authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      component.submit();
      tick();

      expect(component.error).toBe('Credenciales inválidas');
      expect(toastServiceSpy.error).toHaveBeenCalledWith('Credenciales inválidas');
      expect(component.loading).toBeFalse();
    }));
  });

  describe('submit - register', () => {
    beforeEach(() => {
      component.mode = 'register';
    });

    it('should call register service with correct data', fakeAsync(() => {
      authServiceSpy.register.and.returnValue(of({ access_token: 'token', user: {} } as any));

      component.form.patchValue({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      component.submit();
      tick();

      expect(authServiceSpy.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    }));

    it('should handle empty name as undefined', fakeAsync(() => {
      authServiceSpy.register.and.returnValue(of({ access_token: 'token', user: {} } as any));

      component.form.patchValue({
        name: '',
        email: 'test@example.com',
        password: 'password123',
      });

      component.submit();
      tick();

      expect(authServiceSpy.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: undefined,
      });
    }));

    it('should show success message on register', fakeAsync(() => {
      authServiceSpy.register.and.returnValue(of({ access_token: 'token', user: {} } as any));

      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.submit();
      tick();

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Cuenta creada correctamente.');
    }));

    it('should handle register error', fakeAsync(() => {
      const errorResponse = { error: { message: 'Email ya existe' } };
      authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

      component.form.patchValue({
        email: 'existing@example.com',
        password: 'password123',
      });

      component.submit();
      tick();

      expect(component.error).toBe('Email ya existe');
      expect(toastServiceSpy.error).toHaveBeenCalled();
    }));
  });
});
