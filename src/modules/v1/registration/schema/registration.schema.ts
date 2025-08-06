import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Registration {
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
    description: 'Webinar ID reference',
    required: true,
  })
  @Prop({ 
    required: true, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Webinar' 
  })
  webinarId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: '2025-08-06T10:00:00Z',
    description: 'Registration date',
    required: true,
  })
  @Prop({ required: true, default: Date.now })
  registrationDate: Date;
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
