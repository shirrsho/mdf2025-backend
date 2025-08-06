import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { PaymentStatus } from '@/modules/enum';

@Schema({
  timestamps: true,
})
export class Payment {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Participant ID reference',
    required: true,
  })
  @Prop({ 
    required: true, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User' 
  })
  participantId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: 500,
    description: 'Payment amount',
    required: true,
  })
  @Prop({ required: true })
  amount: number;

  @ApiProperty({
    example: 'BDT',
    description: 'Payment currency',
    required: true,
  })
  @Prop({ required: true, default: 'BDT' })
  currency: string;

  @ApiProperty({
    example: '2025-08-06T10:00:00Z',
    description: 'Payment date',
    required: true,
  })
  @Prop({ required: true, default: Date.now })
  paymentDate: Date;

  @ApiProperty({
    example: 'completed',
    description: 'Payment status',
    required: true,
    enum: PaymentStatus,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: PaymentStatus 
  })
  status: PaymentStatus;

  @ApiProperty({
    example: 'TXN123456789',
    description: 'Unique transaction ID from payment gateway',
    required: true,
  })
  @Prop({ required: true, unique: true })
  transactionId: string;
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
