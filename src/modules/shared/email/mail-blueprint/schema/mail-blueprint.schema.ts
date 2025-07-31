import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
})
export class MailBlueprint {
  @ApiProperty({
    description: 'The unique name of the mail blueprint',
    example: 'WelcomeEmail',
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    description: 'The unique name of the mail blueprint',
    example: 'WelcomeEmail',
  })
  @Prop({ required: false, type: String, default: 'promotion' })
  resourceName: string;

  @ApiProperty({
    description: 'The content/body of the email',
    example: 'Hello, welcome to our platform!',
  })
  @Prop({ required: true })
  bodyContent: string;

  @ApiProperty({
    description: 'The subject line of the email',
    example: 'Welcome to Our Platform',
  })
  @Prop({ required: true })
  subjectContent: string;

  @ApiProperty({
    description: 'List of placeholder keys that can be replaced in the content',
    example: ['username', 'date'],
    isArray: true,
    type: String,
  })
  @Prop({ type: [String], required: true, default: [] })
  placeholders: string[];
}

export type MailBlueprintDocument = HydratedDocument<MailBlueprint>;
export const MailBlueprintSchema = SchemaFactory.createForClass(MailBlueprint);

MailBlueprintSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

MailBlueprintSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
