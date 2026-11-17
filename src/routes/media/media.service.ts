import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { S3Service } from 'src/shared/services/s3.service';

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadFile({
            fileName: `images/${file.filename}`,
            filePath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return { url: res.Location };
          });
      }),
    );

    // Xóa file trong folder "uploads" sau khi up thành công lên S3
    await Promise.all(
      files.map((file) => {
        return unlink(file.path);
      }),
    );

    return result;
  }
}
