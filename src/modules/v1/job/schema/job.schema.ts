import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Job {
  @ApiProperty({
    example: 'Job name',
    description: 'Job name',
    required: true,
  })
  @Prop({ required: true })
  jobName: string;

  @ApiProperty({
    example: 'Job slug',
    description: 'Job slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type JobDocument = HydratedDocument<Job>;
export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

JobSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

JobSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.jobName);
  }
  next();
});

JobSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.jobName) {
    update.slug = slugify(update?.jobName);
  }
  next();
});
