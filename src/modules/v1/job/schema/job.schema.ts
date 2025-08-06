import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { JobType, ExperienceLevel, JobStatus } from '@/modules/enum';

@Schema({
  timestamps: true,
})
export class Job {
  @ApiProperty({
    example: 'Senior Software Developer',
    description: 'Job title',
    required: true,
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'We are looking for an experienced software developer...',
    description: 'Job description',
    required: true,
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Company ID reference',
    required: true,
  })
  @Prop({ 
    required: true, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Company' 
  })
  companyId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: 'Dhaka, Bangladesh',
    description: 'Job location',
    required: true,
  })
  @Prop({ required: true })
  location: string;

  @ApiProperty({
    example: 'full_time',
    description: 'Job type',
    required: true,
    enum: JobType,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: JobType 
  })
  type: JobType;

  @ApiProperty({
    example: 'senior',
    description: 'Experience level required',
    required: true,
    enum: ExperienceLevel,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: ExperienceLevel 
  })
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    example: 80000,
    description: 'Minimum salary',
    required: false,
  })
  @Prop({ required: false })
  salaryMin?: number;

  @ApiProperty({
    example: 120000,
    description: 'Maximum salary',
    required: false,
  })
  @Prop({ required: false })
  salaryMax?: number;

  @ApiProperty({
    example: 'BDT',
    description: 'Salary currency',
    required: false,
  })
  @Prop({ required: false, default: 'BDT' })
  currency?: string;

  @ApiProperty({
    example: ['JavaScript', 'Node.js', 'React'],
    description: 'Required skills',
    required: true,
  })
  @Prop({ required: true, type: [String] })
  skills: string[];

  @ApiProperty({
    example: ['Bachelor degree in Computer Science', '3+ years experience'],
    description: 'Job requirements',
    required: true,
  })
  @Prop({ required: true, type: [String] })
  requirements: string[];

  @ApiProperty({
    example: ['Health insurance', 'Flexible working hours'],
    description: 'Job benefits',
    required: false,
  })
  @Prop({ required: false, type: [String] })
  benefits?: string[];

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Application deadline',
    required: true,
  })
  @Prop({ required: true })
  applicationDeadline: Date;

  @ApiProperty({
    example: 'open',
    description: 'Job status',
    required: true,
    enum: JobStatus,
  })
  @Prop({ 
    required: true, 
    type: String, 
    enum: JobStatus,
    default: JobStatus.OPEN 
  })
  status: JobStatus;

  @ApiProperty({
    example: 'senior-software-developer',
    description: 'Job slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;
}

export type JobDocument = HydratedDocument<Job>;
export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

JobSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

JobSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title);
  }
  next();
});

JobSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.title) {
    update.slug = slugify(update?.title);
  }
  next();
});
