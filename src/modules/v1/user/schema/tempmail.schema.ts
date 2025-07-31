import { TempMailType } from '@/modules/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class TempMail {
  @Prop({ type: String, required: true })
  tempEmail: string;

  @Prop({ type: String, required: true })
  tempName: string;

  @Prop({ type: String, enum: TempMailType, required: true })
  tempMailType: string;

  @Prop({ type: String, required: false })
  convertedMail: string;

  @Prop({ type: String, required: false })
  convertedName: string;
}

export type TempMailDocument = HydratedDocument<TempMail>;
export const TempMailSchema = SchemaFactory.createForClass(TempMail);

TempMailSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TempMailSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    delete ret.otp;
    delete ret.password;
    return ret;
  },
});
