import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
})
export class AuthPageComponent {
  loading = false;
  error: string | null = null;
  mode: 'login' | 'register' = 'login';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  switchMode(next: 'login' | 'register') {
    if (this.mode === next) return;
    this.mode = next;
    this.error = null;
    this.form.reset();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { name, email, password } = this.form.getRawValue();

    const obs =
      this.mode === 'login'
        ? this.auth.login({ email, password })
        : this.auth.register({ email, password, name: name || undefined });

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(
          this.mode === 'login'
            ? 'Sesión iniciada correctamente.'
            : 'Cuenta creada correctamente.',
        );
        this.router.navigateByUrl('/posts');
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err?.error?.message ??
          (this.mode === 'login'
            ? 'No se pudo iniciar sesión. Revisa tus datos.'
            : 'No se pudo crear la cuenta. Inténtalo de nuevo.');
        this.error = msg;
        this.toast.error(msg);
      },
    });
  }
}