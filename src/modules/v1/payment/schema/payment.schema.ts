import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Payment {
  @ApiProperty({
    example: 'Payment name',
    description: 'Payment name',
    required: true,
  })
  @Prop({ required: true })
  paymentName: string;

  @ApiProperty({
    example: 'Payment slug',
    description: 'Payment slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

PaymentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

PaymentSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.paymentName);
  }
  next();
});

PaymentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.paymentName) {
    update.slug = slugify(update?.paymentName);
  }
  next();
});
