import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/responses/api-response.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const created = new this.postModel(createPostDto);
    return created.save();
  }

  async createBulk(createPostDtos: CreatePostDto[]): Promise<Post[]> {
    if (!createPostDtos?.length) return [];
    // insertMany en una sola vuelta a la BD
    const created = await this.postModel.insertMany(createPostDtos);
    return created;
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResponse<Post>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;
    // count y find en paralelo para no hacer dos viajes secuenciales
    const [data, total] = await Promise.all([
      this.postModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.postModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).lean().exec();
    if (!post) {
      throw new NotFoundException(`Post con id "${id}" no encontrado`);
    }
    return post as Post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .lean()
      .exec();
    if (!post) {
      throw new NotFoundException(`Post con id "${id}" no encontrado`);
    }
    return post as Post;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Post con id "${id}" no encontrado`);
    }
  }
}
