import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'ID del post (MongoDB ObjectId)' })
  @IsMongoId()
  postId: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'juan@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Contenido (body) del comentario...', maxLength: 1000 })
  @IsString()
  @MinLength(1, { message: 'El body no puede estar vacío' })
  @MaxLength(1000)
  body: string;
}
