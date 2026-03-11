import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class CreatePostBulkDto {
  @ApiProperty({ type: [CreatePostDto], description: 'Array de posts a crear' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostDto)
  posts: CreatePostDto[];
}
