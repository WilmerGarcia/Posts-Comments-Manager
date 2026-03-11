import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { POST_STATUS, PostStatus } from '../post-status.enum';

export type PostDocument = Post & Document;

export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: String, enum: Object.values(POST_STATUS), default: POST_STATUS.CREADO })
  status: PostStatus;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
