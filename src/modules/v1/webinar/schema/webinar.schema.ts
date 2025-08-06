import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { WebinarStatus } from '@/modules/enum';

@Schema({
  timestamps: true,
})
export class Webinar {
  @ApiProperty({
    example: 'Career Development in Tech Industry',
    description: 'Webinar title',
    required: true,
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'Join us for an insightful discussion on career development...',
    description: 'Webinar description',
    required: true,
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Host company ID reference',
    required: true,
  })
  @Prop({ 
    required: true, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Company' 
  })
  hostId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '2025-08-15T14:00:00Z',
    description: 'Webinar scheduled date and time',
    required: true,
  })
  @Prop({ required: true })
  scheduledDate: Date;

  @ApiProperty({
    example: 90,
    description: 'Duration in minutes',
    required: true,
  })
  @Prop({ required: true })
  duration: number;

  @ApiProperty({
    example: 100,
    description: 'Maximum number of participants',
    required: false,
  })
  @Prop({ required: false })
  maxParticipants?: number;

  @ApiProperty({
    example: 'https://zoom.us/j/123456789',
    description: 'Meeting link for the webinar',
    required: false,
  })
  @Prop({ required: false })
  meetingLink?: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Webinar category/topic',
    required: false,
  })
  @Prop({ required: false })
  category?: string;

  @ApiProperty({
    example: 'scheduled',
    description: 'Webinar status',
    required: true,
    enum: WebinarStatus,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: WebinarStatus,
    default: WebinarStatus.SCHEDULED 
  })
  status: WebinarStatus;

  @ApiProperty({
    example: 'https://company.com/webinar-banner.jpg',
    description: 'Webinar banner image URL',
    required: false,
  })
  @Prop({ required: false })
  bannerUrl?: string;
}

export type WebinarDocument = HydratedDocument<Webinar>;
export const WebinarSchema = SchemaFactory.createForClass(Webinar);

WebinarSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

WebinarSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
