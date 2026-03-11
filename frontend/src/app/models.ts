/** Estados de un post. Debe coincidir con el backend. */
export const POST_STATUS = {
  CREADO: 'CREADO',
  VERIFICADO: 'VERIFICADO',
  PUBLICADO: 'PUBLICADO',
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export interface Post {
  _id: string;
  title: string;
  body: string;
  author: string;
  status?: PostStatus;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  postId: string;
  name: string;
  email: string;
  body: string;
  createdAt?: string;
}

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  token: string;
  avatar?: string;
}

