import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { POST_STATUS, PostStatus } from '../post-status.enum';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  // Nombre que se muestra como autor en el post (puede ser "Anónimo", etc.)
  @Prop({ required: true })
  author: string;

  // ID del usuario que realmente creó el post (para "mis posts" y permisos)
  @Prop()
  createdByUserId?: string;

  @Prop({ type: String, enum: Object.values(POST_STATUS), default: POST_STATUS.CREADO })
  status: PostStatus;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
