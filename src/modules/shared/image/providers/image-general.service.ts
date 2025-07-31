import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Image, ImageDocument } from '../schema/image.schema';
import { Model } from 'mongoose';
import { MediaType, StorageType } from '@/modules/enum';
import { DynamicDto } from '../dtos/dynamic.dto';
import { buildWhereBuilder, PaginationResponse } from '@/modules/utils';

@Injectable()
export class ImagesGeneralService {
  private s3: AWS.S3;
  private keyPrefix: string;
  private isVdoChiper: boolean;
  private apiSecret: string;

  constructor(
    @InjectModel(Image.name)
    private readonly imageModel: Model<ImageDocument>,
    private readonly configService: ConfigService,
  ) {
    this.keyPrefix = this.configService.get('DGO_KEY_PREFIX');
    this.isVdoChiper =
      this.configService.get('VDO_CIPHER_ACTIVATE') === 'true' ? true : false;
    this.apiSecret = this.configService.get('VDO_CIPHER_API_SECRET');

    const spacesEndpoint = this.configService.get('DGO_SPACE_ENDPOINT');

    const accessKeyId = this.configService.get('DGO_ACCESS');
    const secretAccessKey = this.configService.get('DGO_SECRET_ACCESS');
    this.s3 = new AWS.S3({
      s3ForcePathStyle: false,
      region: this.configService.get('DGO_REGION'),
      endpoint: spacesEndpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async uploadImageFromUrl(imageUrl?: string) {
    if (!imageUrl) {
      return null;
    }
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const fileBuffer = Buffer.from(response.data);

      const uniqueIdentifier = uuidv4();
      const currentDate = dayjs().format('YYYYMMDD');
      const key = `${this.keyPrefix}/${currentDate}/${uniqueIdentifier}.png`;
      const bucketName = this.configService.get('DGO_SPACE_NAME');

      await this.s3
        .putObject({
          Bucket: bucketName,
          Key: key,
          Body: fileBuffer,
          ACL: 'public-read',
          ContentType: response.headers['content-type'],
        })
        .promise();

      return key;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      return null;
    }
  }

  async uploadImageToDoV1(file: any) {
    const uniqueIdentifier = uuidv4();
    const key = `${this.keyPrefix}/${uniqueIdentifier}-${file.originalname}`;
    const bucketName = this.configService.get('DGO_SPACE_NAME');
    const fileData = await fs.promises.readFile(`${file.path}`);

    await this.s3
      .putObject({
        Bucket: bucketName,
        Key: key,
        Body: fileData,
        ACL: 'public-read',
        ContentType: file.mimetype,
      })
      .promise();

    await fs.promises.unlink(`${file.path}`);
    return key;
  }

  async uploadImageToSpace(file: any, user: any) {
    const mimeType = file.mimetype;
    if (this.isVdoChiper && mimeType.startsWith('video/')) {
      return this.uploadImageToVodChiper(file, user);
    } else {
      return this.uploadImageToDo(file, user);
    }
  }

  async uploadImageToVodChiper(file: any, user: any) {
    try {
      const folderId = this.configService.get('VDO_CIPHER_FOLDER_ID');
      const uniqueIdentifier = uuidv4();
      const key = `${this.keyPrefix}/${uniqueIdentifier}-${file.originalname}`;
      const url = `https://dev.vdocipher.com/api/videos?title=${key}&folderId=${folderId}`;
      const policyResponse = await axios.put(url, null, {
        headers: { Authorization: `Apisecret ${this.apiSecret}` },
      });

      const image = await this.imageModel.create({
        uploader: user._id,
        key: key,
        name: file.originalname,
        storageType: StorageType.VDO_CIPHER,
        providerId: policyResponse.data.videoId,
        mediaType: MediaType.VIDEO,
      });

      const clientPayload = policyResponse.data.clientPayload;
      const formData = new FormData();

      formData.append('policy', clientPayload.policy);
      formData.append('key', clientPayload.key);
      formData.append('x-amz-signature', clientPayload['x-amz-signature']);
      formData.append('x-amz-algorithm', clientPayload['x-amz-algorithm']);
      formData.append('x-amz-date', clientPayload['x-amz-date']);
      formData.append('x-amz-credential', clientPayload['x-amz-credential']);
      formData.append('success_action_status', '201');
      formData.append('success_action_redirect', '');

      const fileData = await fs.promises.readFile(`${file.path}`);
      formData.append('file', fileData, { filename: file.originalname });

      await axios.post(clientPayload.uploadLink, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      await image.save();
      await fs.promises.unlink(`${file.path}`);
      return image;
    } catch (error) {
      console.log('error in uploadImageToVodChiper');
      console.log(error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async uploadImageToDo(file: any, user: any) {
    const uniqueIdentifier = uuidv4();
    const key = `${this.keyPrefix}/${uniqueIdentifier}-${file.originalname}`;
    const bucketName = this.configService.get('DGO_SPACE_NAME');
    const fileData = await fs.promises.readFile(`${file.path}`);

    await this.s3
      .putObject({
        Bucket: bucketName,
        Key: key,
        Body: fileData,
        ACL: 'public-read',
        ContentType: file.mimetype,
      })
      .promise();

    const mimeType = file.mimetype;
    const image = await this.imageModel.create({
      uploader: user._id,
      key: key,
      name: file.originalname,
      storageType: StorageType.DGO,
      mediaType: mimeType.startsWith('image/')
        ? MediaType.IMAGE
        : MediaType.VIDEO,
    });
    await image.save();
    await fs.promises.unlink(`${file.path}`);
    return image;
  }

  async getOtp(id: string) {
    const image = await this.imageModel.findById(id);
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    try {
      const url = `https://dev.vdocipher.com/api/videos/${image.providerId}/otp`;
      const otpResponse = await axios.post(
        url,
        { ttl: 300 },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Apisecret ${this.apiSecret}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return otpResponse.data;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(
    queryParams: DynamicDto,
  ): Promise<PaginationResponse<ImageDocument>> {
    const {
      select = {},
      where = {},
      page = 1,
      limit = 10,
      sort = 'newest',
    } = queryParams?.query || {};
    const skip = ((page > 1 ? page : 1) - 1) * (limit > 0 ? limit : 1);
    const whereClause = buildWhereBuilder(where);
    const count = await this.imageModel.countDocuments(whereClause);
    const images = await this.imageModel
      .find(whereClause)
      .select(select)
      .sort({ createdAt: sort === 'newest' ? -1 : 1 })
      .limit(limit)
      .skip(skip)
      .exec();
    return { data: images, count };
  }
}
