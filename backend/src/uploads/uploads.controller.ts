import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomUUID } from 'crypto';

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
}

