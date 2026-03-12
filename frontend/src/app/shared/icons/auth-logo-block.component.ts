import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-logo-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-logo-block">
      <svg
        class="auth-logo-block-icon"
        width="52"
        height="52"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="#2563EB"/>
        <rect x="13" y="13" width="32" height="21" rx="4" fill="white"/>
        <rect x="18" y="19" width="15" height="3" rx="1.5" fill="#2563EB"/>
        <rect x="18" y="25" width="10" height="3" rx="1.5" fill="#93B4F5"/>
        <rect x="22" y="37" width="24" height="16" rx="4" fill="#1D4ED8"/>
        <rect x="27" y="42" width="12" height="2.5" rx="1.25" fill="white" opacity="0.85"/>
        <rect x="27" y="47" width="8" height="2.5" rx="1.25" fill="white" opacity="0.45"/>
        <polygon points="22,37 26,32 30,37" fill="#1D4ED8"/>
      </svg>
      <div class="auth-logo-block-text">
        <span class="auth-logo-block-title">Posts &amp; Comments</span>
        <span class="auth-logo-block-subtitle">Manager</span>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-logo-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .auth-logo-block-icon {
        flex-shrink: 0;
        display: block;
      }
      .auth-logo-block-text {
        text-align: center;
      }
      .auth-logo-block-title {
        display: block;
        font-size: 17px;
        font-weight: 500;
        color: #111827;
        line-height: 1.2;
      }
      .auth-logo-block-subtitle {
        display: block;
        font-size: 12px;
        color: #2563EB;
        margin-top: 1px;
        line-height: 1.2;
      }
    `,
  ],
})
export class AuthLogoBlockComponent {}
