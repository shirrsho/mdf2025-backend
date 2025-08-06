import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Webinar {
  @ApiProperty({
    example: 'Webinar name',
    description: 'Webinar name',
    required: true,
  })
  @Prop({ required: true })
  webinarName: string;

  @ApiProperty({
    example: 'Webinar slug',
    description: 'Webinar slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type WebinarDocument = HydratedDocument<Webinar>;
export const WebinarSchema = SchemaFactory.createForClass(Webinar);

WebinarSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

WebinarSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

WebinarSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.webinarName);
  }
  next();
});

WebinarSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.webinarName) {
    update.slug = slugify(update?.webinarName);
  }
  next();
});
