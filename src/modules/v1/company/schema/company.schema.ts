import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { CompanySize } from '@/modules/enum';

@Schema({
  timestamps: true,
})
export class Company {
  @ApiProperty({
    example: 'Tech Solutions Ltd',
    description: 'Company name',
    required: true,
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    example: 'We are a leading technology solutions provider...',
    description: 'Company description',
    required: true,
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Company logo URL',
    required: false,
  })
  @Prop({ required: false })
  logoUrl?: string;

  @ApiProperty({
    example: 'https://www.company.com',
    description: 'Company website URL',
    required: true,
  })
  @Prop({ required: true })
  website: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Company industry',
    required: true,
  })
  @Prop({ required: true })
  industry: string;

  @ApiProperty({
    example: 'Dhaka, Bangladesh',
    description: 'Company location',
    required: true,
  })
  @Prop({ required: true })
  location: string;

  @ApiProperty({
    example: 'medium',
    description: 'Company size',
    required: true,
    enum: CompanySize,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: CompanySize 
  })
  size: CompanySize;

  @ApiProperty({
    example: 'John Doe',
    description: 'Main contact person at the company',
    required: false,
  })
  @Prop({ required: false })
  contactPerson?: string;

  @ApiProperty({
    example: 'contact@company.com',
    description: 'Company contact email',
    required: false,
  })
  @Prop({ required: false })
  contactEmail?: string;

  @ApiProperty({
    example: '+8801234567890',
    description: 'Company contact phone',
    required: false,
  })
  @Prop({ required: false })
  contactNumber?: string;

  @ApiProperty({
    example: 'company-slug',
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
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name);
  }
  next();
});

CompanySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.name) {
    update.slug = slugify(update?.name);
  }
  next();
});
