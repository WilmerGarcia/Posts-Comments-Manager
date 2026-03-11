import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Contraseña actual del usuario' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'Nueva contraseña', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(100)
  newPassword: string;
}

