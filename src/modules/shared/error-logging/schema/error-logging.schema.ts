import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class ErrorLogging {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: false })
  stack?: string;
}

export type ErrorLoggingDocument = HydratedDocument<ErrorLogging>;
export const ErrorLoggingSchema = SchemaFactory.createForClass(ErrorLogging);

ErrorLoggingSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ErrorLoggingSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
