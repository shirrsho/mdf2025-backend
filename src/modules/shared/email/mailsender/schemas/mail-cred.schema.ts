import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class MailCred {
  @Prop({ required: true, type: String, unique: true })
  transporterName: string;

  @Prop({ required: true, type: String })
  smtpHost: string;

  @Prop({ required: true, type: String })
  smtpPort: string;

  @Prop({ required: true, type: String })
  smtpFrom: string;

  @Prop({ required: true, type: String })
  smtpUser: string;

  @Prop({ required: true, type: String })
  smtpPassword: string;

  @Prop({ required: false, type: Boolean, default: false })
  isDefault: boolean;
}

export type MailCredDocument = HydratedDocument<MailCred>;
export const MailSchema = SchemaFactory.createForClass(MailCred);

MailSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

MailSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
