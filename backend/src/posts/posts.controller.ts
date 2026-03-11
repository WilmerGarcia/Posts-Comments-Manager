import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostBulkDto } from './dto/create-post-bulk.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un post' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Carga masiva de posts' })
  createBulk(@Body() dto: CreatePostBulkDto) {
    return this.postsService.createBulk(dto.posts);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los posts' })
  findAll(@Query() pagination: PaginationDto) {
    return this.postsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un post por ID' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar un post' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un post' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.postsService.remove(id);
  }
}
