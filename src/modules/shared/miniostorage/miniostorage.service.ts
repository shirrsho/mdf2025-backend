import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as Minio from 'minio';
import * as fs from 'fs';

@Injectable()
export class MiniostorageService {
  private readonly minioClient: Minio.Client;
  private bucketName: string;
  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get('MINIO_PORT')),
      useSSL: false,
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.get('MINIO_BUCKET_NAME');
  }

  private getFileExtension(originalname: string) {
    // Split the filename by '.' to get the parts
    const parts = originalname.split('.');
    // The last part should be the file extension
    const extension = parts[parts.length - 1];
    return extension;
  }

  private async uploadToMinio(file: any, isTemp = false): Promise<string> {
    console.log(isTemp);
    try {
      const fileName =
        file.filename + '.' + this.getFileExtension(file.originalname);
      await this.minioClient.fPutObject(this.bucketName, fileName, file.path, {
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
      });

      return fileName;
    } catch (error) {
      throw new InternalServerErrorException(error);
    } finally {
      fs.unlinkSync(file.path);
    }
  }

  async uploadFile(file: any) {
    const result = await this.uploadToMinio(file);
    if (result) {
      return { status: 'success', url: result };
    } else {
      return { status: 'fail', result: 'failed' };
    }
  }
}
