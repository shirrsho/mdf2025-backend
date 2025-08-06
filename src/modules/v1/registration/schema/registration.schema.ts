import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Registration {
  @ApiProperty({
    example: 'Registration name',
    description: 'Registration name',
    required: true,
  })
  @Prop({ required: true })
  registrationName: string;

  @ApiProperty({
    example: 'Registration slug',
    description: 'Registration slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type RegistrationDocument = HydratedDocument<Registration>;
export const RegistrationSchema = SchemaFactory.createForClass(Registration);

RegistrationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

RegistrationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

RegistrationSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.registrationName);
  }
  next();
});

RegistrationSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.registrationName) {
    update.slug = slugify(update?.registrationName);
  }
  next();
});
