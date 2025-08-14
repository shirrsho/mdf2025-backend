import { slugify } from '@/modules/utils/slugify';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Timeslot {
  @ApiProperty({
    example: 'Morning Session',
    description: 'Timeslot name',
    required: true,
  })
  @Prop({ required: true })
  timeslotName: string;

  @ApiProperty({
    example: 'morning-session',
    description: 'Timeslot slug',
    required: false,
  })
  @Prop({ required: false })
  slug: string;

  @ApiProperty({
    example: '2025-08-15T09:00:00Z',
    description: 'Start time of the timeslot',
    required: true,
  })
  @Prop({ required: true })
  startTime: Date;

  @ApiProperty({
    example: '2025-08-15T12:00:00Z',
    description: 'End time of the timeslot',
    required: true,
  })
  @Prop({ required: true })
  endTime: Date;

  @ApiProperty({
    example: 'Day 1 timeslot for webinars',
    description: 'Optional description of the timeslot',
    required: false,
  })
  @Prop({ required: false })
  description?: string;
}

export type TimeslotDocument = HydratedDocument<Timeslot>;
export const TimeslotSchema = SchemaFactory.createForClass(Timeslot);

TimeslotSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TimeslotSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

TimeslotSchema.pre('save', function (next) {
  if (this.isModified('timeslotName') || this.isNew) {
    this.slug = slugify(this.timeslotName);
  }
  next();
});

TimeslotSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update?.timeslotName) {
    update.slug = slugify(update?.timeslotName);
  }
  next();
});
