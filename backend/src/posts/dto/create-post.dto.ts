import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Mi primer post', maxLength: 200 })
  @IsString()
  @MinLength(1, { message: 'El título no puede estar vacío' })
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Contenido (body) del post...' })
  @IsString()
  @MinLength(1, { message: 'El body no puede estar vacío' })
  body: string;

  @ApiProperty({ example: 'Autor del post' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  author: string;
}
