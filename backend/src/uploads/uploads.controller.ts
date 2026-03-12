import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Response } from 'express';

function postsImagesStorage() {
  return diskStorage({
    destination: join(__dirname, '..', '..', 'uploads', 'posts'),
    filename: (_req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      const name = randomUUID();
      cb(null, `${name}.${ext}`);
    },
  });
}

function userAvatarStorage() {
  return diskStorage({
    destination: join(__dirname, '..', '..', 'uploads', 'avatars'),
    filename: (_req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      const name = randomUUID();
      cb(null, `${name}.${ext}`);
    },
  });
}

@Controller('uploads')
export class UploadsController {
  @Post('posts')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: postsImagesStorage(),
    }),
  )
  uploadPostImages(@UploadedFiles() files: Express.Multer.File[]) {
    const paths = files.map((file) => `/uploads/posts/${file.filename}`);
    return paths;
  }

  /**
   * Endpoint explícito para servir imágenes de posts.
   * Evita problemas si, por cualquier motivo, el ServeStaticModule no responde.
   */
  @Get('posts/:filename')
  servePostImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'uploads', 'posts', filename);
    return res.sendFile(filePath, (err) => {
      if (err) {
        throw new NotFoundException('Imagen de post no encontrada');
      }
    });
  }

  @Post('avatar')
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: userAvatarStorage(),
    }),
  )
  uploadAvatar(@UploadedFiles() files: Express.Multer.File[]) {
    const file = files[0];
    const path = `/uploads/avatars/${file.filename}`;
    return { path };
  }

  @Get('avatars/:filename')
  serveAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'uploads', 'avatars', filename);
    return res.sendFile(filePath, (err) => {
      if (err) {
        throw new NotFoundException('Avatar no encontrado');
      }
    });
  }
}

