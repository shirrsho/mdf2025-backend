import { InteractionType, ResourceType } from '@/modules/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Interaction {
  @Prop({ type: String, required: true })
  resource: string;

  @Prop({ type: String, enum: ResourceType, required: true })
  resourceType: string;

  @Prop({ type: String, enum: InteractionType, required: true })
  interactionType: string;
}

export type InteractionDocument = HydratedDocument<Interaction>;
export const InteractionSchema = SchemaFactory.createForClass(Interaction);
