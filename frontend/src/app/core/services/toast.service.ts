import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private counter = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'info', durationMs = 3500) {
    const toast: Toast = { id: ++this.counter, message, type };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(toast.id), durationMs);
    }
  }

  success(message: string, durationMs = 3000) {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 4500) {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 3500) {
    this.show(message, 'info', durationMs);
  }

  dismiss(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
