import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private toast: ToastService) {}

  handle(error: unknown): string {
    const message = this.toMessage(error);
    this.toast.error(message);
    return message;
  }

  private toMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
      }

      const backendMessage =
        (error.error && (error.error.message || error.error.error)) ??
        error.message;

      switch (error.status) {
        case 400:
          return backendMessage || 'La petición no es válida.';
        case 401:
          return backendMessage || 'Tu sesión ha expirado o no estás autenticado.';
        case 403:
          return backendMessage || 'No tienes permisos para realizar esta acción.';
        case 404:
          return backendMessage || 'No se encontró el recurso solicitado.';
        case 409:
          return backendMessage || 'La operación no se pudo completar por un conflicto.';
        case 500:
        case 502:
        case 503:
          return (
            backendMessage ||
            'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
          );
        default:
          return backendMessage || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
      }
    }

    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }
}

