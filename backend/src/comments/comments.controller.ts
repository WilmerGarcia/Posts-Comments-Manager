import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

class CommentsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'ID del post para filtrar comentarios' })
  @IsOptional()
  @IsMongoId()
  postId?: string;
}

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar por post: GET /comments?postId={id}' })
  findComments(
    @Query() query: CommentsQueryDto,
  ) {
    const { postId, ...pagination } = query;
    // Si viene postId en query, listar solo los de ese post; si no, todos (paginado)
    if (postId) {
      const validId = new ParseObjectIdPipe().transform(postId);
      return this.commentsService.findByPostId(validId, pagination);
    }
    return this.commentsService.findAll(pagination);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear comentario' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un comentario' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un comentario' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentsService.remove(id);
  }
}
