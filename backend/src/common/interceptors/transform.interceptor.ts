import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../utils/api-response.util';

// Todas las respuestas OK salen como { success: true, message: 'OK', data }
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { success: true; message: string; data: T }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ success: true; message: string; data: T }> {
    return next.handle().pipe(map((data) => ApiResponse.success(data)));
  }
}
