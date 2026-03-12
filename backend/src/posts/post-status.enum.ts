export const POST_STATUS = {
  CREADO: 'CREADO',
  PUBLICADO: 'PUBLICADO',
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];
