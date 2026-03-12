import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/responses/api-response.interface';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private async attachAvatarToMany(comments: any[]): Promise<any[]> {
    if (!comments.length) return comments;
    const emails = Array.from(new Set(comments.map((c) => c.email).filter(Boolean)));
    if (!emails.length) return comments;

    const users = await this.userModel
      .find({ email: { $in: emails } })
      .select('email avatar')
      .lean()
      .exec();

    const byEmail = new Map<string, string | undefined>(
      users.map((u: any) => [u.email, u.avatar]),
    );

    return comments.map((c) => ({
      ...c,
      avatar: byEmail.get(c.email) ?? null,
    }));
  }

  private async attachAvatarToOne(comment: any | null): Promise<any | null> {
    if (!comment) return comment;
    const [result] = await this.attachAvatarToMany([comment]);
    return result;
  }

  async create(createCommentDto: CreateCommentDto): Promise<any> {
    // postId viene como string del body; MongoDB espera ObjectId
    const created = new this.commentModel({
      ...createCommentDto,
      postId: new Types.ObjectId(createCommentDto.postId),
    });
    const saved = await created.save();
    const plain = saved.toObject();
    return this.attachAvatarToOne(plain);
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResponse<Comment>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [raw, total] = await Promise.all([
      this.commentModel
        .find()
        .sort({ createdAt: -1 })
        .populate('postId', 'title')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.commentModel.countDocuments().exec(),
    ]);

    const data = await this.attachAvatarToMany(raw);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByPostId(
    postId: string,
    pagination?: PaginationDto,
  ): Promise<PaginatedResponse<Comment>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [raw, total] = await Promise.all([
      this.commentModel
        .find({ postId: new Types.ObjectId(postId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.commentModel.countDocuments({ postId: new Types.ObjectId(postId) }).exec(),
    ]);

    const data = await this.attachAvatarToMany(raw);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Comment> {
    const raw = await this.commentModel
      .findById(id)
      .populate('postId', 'title')
      .lean()
      .exec();
    if (!raw) {
      throw new NotFoundException(`Comentario con id "${id}" no encontrado`);
    }
    const comment = await this.attachAvatarToOne(raw);
    return comment as Comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const raw = await this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .lean()
      .exec();
    if (!raw) {
      throw new NotFoundException(`Comentario con id "${id}" no encontrado`);
    }
    const comment = await this.attachAvatarToOne(raw);
    return comment as Comment;
  }

  async remove(id: string): Promise<void> {
    const result = await this.commentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Comentario con id "${id}" no encontrado`);
    }
  }
}
