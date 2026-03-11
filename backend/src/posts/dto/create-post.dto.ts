import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsArray, IsUrl, IsOptional, IsIn } from 'class-validator';
import { POST_STATUS, PostStatus } from '../post-status.enum';

const POST_STATUS_VALUES = Object.values(POST_STATUS) as [PostStatus, ...PostStatus[]];

export class CreatePostDto {
  @ApiProperty({ example: 'Mi primer post', maxLength: 200 })
  @IsString()
  @MinLength(1, { message: 'El título no puede estar vacío' })
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Contenido del post...' })
  @IsString()
  @MinLength(1, { message: 'El body no puede estar vacío' })
  body: string;

  @ApiProperty({ example: 'Autor del post' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  author: string;

  @ApiPropertyOptional({ enum: Object.values(POST_STATUS), default: POST_STATUS.CREADO })
  @IsOptional()
  @IsIn(POST_STATUS_VALUES)
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'URLs de imágenes del post', type: [String], example: [] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}
