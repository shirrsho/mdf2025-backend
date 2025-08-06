import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ApplicationStatus } from '@/modules/enum';

@Schema({
  timestamps: true,
})
export class Application {
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
    example: '507f1f77bcf86cd799439012',
    description: 'Job ID reference',
    required: true,
  })
  @Prop({ 
    required: true, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Job' 
  })
  jobId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'Company ID reference (denormalized)',
    required: true,
  })
  @Prop({ 
    required: true, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Company' 
  })
  companyId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '2025-08-06T10:00:00Z',
    description: 'Application date',
    required: true,
  })
  @Prop({ required: true, default: Date.now })
  applicationDate: Date;

  @ApiProperty({
    example: 'pending',
    description: 'Application status',
    required: true,
    enum: ApplicationStatus,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: ApplicationStatus, 
    default: ApplicationStatus.PENDING 
  })
  status: ApplicationStatus;
}

export type ApplicationDocument = HydratedDocument<Application>;
export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
