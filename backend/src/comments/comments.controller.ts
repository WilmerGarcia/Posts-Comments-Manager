import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar por post: GET /comments?postId={id}' })
  findComments(
    @Query('postId') postId: string | undefined,
    @Query() pagination: PaginationDto,
  ) {
    // Si viene postId en query, listar solo los de ese post; si no, todos (paginado)
    if (postId) {
      const validId = new ParseObjectIdPipe().transform(postId);
      return this.commentsService.findByPostId(validId, pagination);
    }
    return this.commentsService.findAll(pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Crear comentario' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un comentario' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentsService.remove(id);
  }
}
