import { SentMailStatus } from '@/modules/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class MailHistory {
  @Prop({ required: true })
  recepitentEmail: string;

  @Prop({ type: String })
  resourceId: string;

  @Prop({ type: String })
  resourceName: string;

  @Prop({ type: String })
  tag: string;

  @Prop({ required: false, enum: SentMailStatus, type: String })
  status: SentMailStatus;

  @Prop({ required: false, default: false })
  isOpened: boolean;

  @Prop({ required: false, type: Date })
  scheduleTime: Date;

  @Prop({ required: false, default: [], type: [Date] })
  openTimes: Date[];

  @Prop({ required: false, default: [], type: [Date] })
  sentTimes: Date[];

  @Prop({ required: false, type: [String], default: [] })
  cc?: string[];

  @Prop({ required: false, type: [String], default: [] })
  bcc?: string[];

  @Prop({ required: false, type: String })
  blueprint: string;

  @Prop({ required: false, type: Map, of: String, default: {} })
  placeValues: Record<string, string>;

  @Prop({ required: false, type: Number })
  priority: number;

  @Prop({ required: false, type: Boolean, default: false })
  isPredefined?: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  rest: any;

  @Prop({ required: false, type: String })
  body: string;

  @Prop({ required: false, type: String })
  subject: string;
}

export type MailHistoryDocument = HydratedDocument<MailHistory>;
export const MailHistorySchema = SchemaFactory.createForClass(MailHistory);

MailHistorySchema.index({ status: 1 });

MailHistorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

MailHistorySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
