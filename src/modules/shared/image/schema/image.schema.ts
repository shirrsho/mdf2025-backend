import { MediaType, StorageStatus, StorageType } from '@/modules/enum';
import { User } from '@/modules/v1/user/schema/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Image {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: false, default: '', type: String })
  providerId: string;

  @Prop({
    required: true,
    type: String,
    enum: StorageType,
    default: StorageType.DGO,
  })
  storageType: StorageType;

  @Prop({
    required: true,
    type: String,
    enum: StorageStatus,
    default: StorageStatus.READY,
  })
  status: StorageStatus;

  @Prop({
    required: true,
    type: String,
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  mediaType: MediaType;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: User.name,
  })
  uploader: Types.ObjectId;

  @Prop({ required: false, default: '', type: String })
  url: string;
}

export type ImageDocument = HydratedDocument<Image>;
export const ImageSchema = SchemaFactory.createForClass(Image);

ImageSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ImageSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
