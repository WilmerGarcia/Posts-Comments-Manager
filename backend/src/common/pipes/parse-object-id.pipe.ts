import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

// Valida que ids en rutas/query sean ObjectId de MongoDB antes de usarlos
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`"${value}" no es un ObjectId de MongoDB válido`);
    }
    return value;
  }
}
