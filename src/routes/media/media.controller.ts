import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import path from 'path';
import { MediaService } from 'src/routes/media/media.service';
import { ParseFilePipeWithUnlink } from 'src/routes/media/parse-file-pipe-with-unlink.pipe';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { Public } from 'src/shared/decorators/auth.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = /(jpg|jpeg|png|webp)$/;
        if (!allowedTypes.test(file.mimetype)) {
          return callback(new BadRequestException('Chỉ cho phép file JPG, JPEG, PNG hoặc WebP'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/, skipMagicNumbersValidation: true }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files);
  }

  @Get('static/:fileName')
  @Public()
  serveFile(@Param('fileName') fileName: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, fileName), (error) => {
      if (error) {
        const notFound = new NotFoundException('File not found');
        res.status(notFound.getStatus()).json(notFound.getResponse());
      }
    });
  }
}
