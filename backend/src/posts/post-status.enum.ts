export const POST_STATUS = {
  CREADO: 'CREADO',
  VERIFICADO: 'VERIFICADO',
  PUBLICADO: 'PUBLICADO',
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];
