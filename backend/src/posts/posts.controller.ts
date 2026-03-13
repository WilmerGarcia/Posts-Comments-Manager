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
import { FilterPostsDto } from './dto/filter-posts.dto';

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
  @ApiOperation({
    summary: 'Listar posts',
    description: 'Si se proporciona createdByUserId, retorna todos los posts de ese usuario. Si no, solo retorna posts PUBLICADOS.',
  })
  findAll(@Query() filters: FilterPostsDto) {
    return this.postsService.findAll(filters);
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
