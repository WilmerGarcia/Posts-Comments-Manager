import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.scss',
})
export class AccountPageComponent implements OnInit {
  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.maxLength(100)]],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  loadingProfile = false;
  savingProfile = false;
  savingPassword = false;
  avatarFile: File | null = null;

  constructor(
    public auth: AuthService,
    private fb: FormBuilder,
    private toast: ToastService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigateByUrl('/auth');
      return;
    }
    const current = this.auth.currentUser;
    if (current) {
      this.profileForm.patchValue({
        name: current.name ?? '',
      });
    }
    this.loadingProfile = true;
    this.auth.getProfile().subscribe({
      next: (data) => {
        this.loadingProfile = false;
        this.profileForm.patchValue({
          name: data.name ?? '',
        });
      },
      error: () => {
        this.loadingProfile = false;
      },
    });
  }

  avatarUrl(): string | null {
    const user = this.auth.currentUser;
    const avatar = user?.avatar;
    if (!avatar) return null;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    return `${environment.apiUrl}${avatar}`;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    this.avatarFile = files && files[0] ? files[0] : null;
  }

  submitProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const name = this.profileForm.getRawValue().name?.trim() || undefined;

    const finishUpdate = (avatarPath?: string) => {
      this.savingProfile = true;
      this.auth.updateProfile({ name, avatar: avatarPath }).subscribe({
        next: () => {
          this.savingProfile = false;
          this.toast.success('Perfil actualizado correctamente.');
          this.avatarFile = null;
        },
        error: (err) => {
          this.savingProfile = false;
          const msg = err?.error?.message ?? 'No se pudo actualizar el perfil.';
          this.toast.error(msg);
        },
      });
    };

    if (this.avatarFile) {
      this.auth.uploadAvatar(this.avatarFile).subscribe({
        next: (res) => {
          finishUpdate(res.path);
        },
        error: (err) => {
          const msg =
            err?.error?.message ?? 'No se pudo subir la foto de perfil.';
          this.toast.error(msg);
        },
      });
    } else {
      finishUpdate();
    }
  }

  submitPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.savingPassword = true;
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.toast.success('Contraseña actualizada correctamente.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.savingPassword = false;
        const msg =
          err?.error?.message ??
          'No se pudo actualizar la contraseña. Revisa la contraseña actual.';
        this.toast.error(msg);
      },
    });
  }
}

