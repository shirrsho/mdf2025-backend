import { AccountStatus, Role, Providers } from '@/modules/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Interaction } from './interaction.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
})
export class User {
  @ApiProperty({
    description: 'User name',
    example: 'shirsho',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'shirsho@gmail.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  tempEmail: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'Contact number for participants',
    example: '+8801234567890',
  })
  @Prop({ required: false })
  contactNumber?: string;

  @ApiProperty({
    description: 'Company reference for company users',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ 
    required: false, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Company' 
  })
  companyId?: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    description: 'User image url',
    example: 'image.jpg',
  })
  @Prop({ required: false })
  imageUrl: string;

  @ApiProperty({
    description: 'User description',
    example: 'I am a developer',
  })
  @Prop({ required: false })
  description: string;

  @ApiProperty({
    description: 'User role',
    example: ['USER'],
  })
  @Prop({
    required: false,
    type: [{ type: String, enum: Role }],
    default: Role.USER,
  })
  role: Role[];

  @ApiProperty({
    description: 'User role permission',
    example: 'user',
  })
  @Prop({ required: true, type: String, default: 'user' })
  rolePermission: string;

  @Prop({
    required: true,
    type: String,
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @ApiProperty({
    description: 'User is verified',
    example: false,
  })
  @Prop({ required: true, default: false })
  isverified: boolean;

  @Prop({
    required: true,
    type: [{ type: String, enum: Providers }],
    default: Providers.Local,
  })
  provider: Providers[];

  @Prop({ required: false, default: 'local' })
  providerId: string;

  @Prop({ required: true, type: [Interaction], default: [] })
  interactions: Interaction[];

  @Exclude()
  @Prop({ required: false })
  otp?: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
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
