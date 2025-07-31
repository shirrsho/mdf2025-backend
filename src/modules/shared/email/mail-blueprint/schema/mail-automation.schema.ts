import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class MailAutomation {
  @ApiPropertyOptional({
    description: 'The name of the mail automation',
    example: 'WelcomeEmail',
  })
  @Prop({ required: false })
  name: string;

  @ApiProperty({
    description: 'The resource name of the mail automation',
    example: 'exam',
  })
  @Prop({ required: true })
  resourceName: string;

  @ApiProperty({
    description: 'The blueprint id of the mail automation',
    example: 'mongo id',
  })
  @Prop({ required: true })
  bluePrintId: string;
}

export type MailAutomationDocument = HydratedDocument<MailAutomation>;
export const MailAutomationSchema =
  SchemaFactory.createForClass(MailAutomation);

MailAutomationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

MailAutomationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
