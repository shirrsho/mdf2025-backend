import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Company {
  @ApiProperty({
    example: 'Company name',
    description: 'Company name',
    required: true,
  })
  @Prop({ required: true })
  companyName: string;

  @ApiProperty({
    example: 'Company slug',
    description: 'Company slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type CompanyDocument = HydratedDocument<Company>;
export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

CompanySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

CompanySchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.companyName);
  }
  next();
});

CompanySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.companyName) {
    update.slug = slugify(update?.companyName);
  }
  next();
});
