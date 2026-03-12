import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  trackById(_: number, toast: { id: number }) {
    return toast.id;
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
