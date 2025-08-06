import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Application {
  @ApiProperty({
    example: 'Application name',
    description: 'Application name',
    required: true,
  })
  @Prop({ required: true })
  applicationName: string;

  @ApiProperty({
    example: 'Application slug',
    description: 'Application slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type ApplicationDocument = HydratedDocument<Application>;
export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

ApplicationSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.applicationName);
  }
  next();
});

ApplicationSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.applicationName) {
    update.slug = slugify(update?.applicationName);
  }
  next();
});
