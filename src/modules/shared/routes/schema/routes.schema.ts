import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Routes {
  @Prop({ required: true })
  methode: string;

  @Prop({ required: false })
  moduleName: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true, unique: true })
  permissionName: string;
}

export type RoutesDocument = HydratedDocument<Routes>;
export const RoutesSchema = SchemaFactory.createForClass(Routes);

RoutesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

RoutesSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});
