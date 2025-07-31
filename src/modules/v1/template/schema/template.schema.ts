import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Template {
  @ApiProperty({
    example: 'Template name',
    description: 'Template name',
    required: true,
  })
  @Prop({ required: true })
  templateName: string;

  @ApiProperty({
    example: 'Template slug',
    description: 'Template slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type TemplateDocument = HydratedDocument<Template>;
export const TemplateSchema = SchemaFactory.createForClass(Template);

TemplateSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TemplateSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

TemplateSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.templateName);
  }
  next();
});

TemplateSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.templateName) {
    update.slug = slugify(update?.templateName);
  }
  next();
});
