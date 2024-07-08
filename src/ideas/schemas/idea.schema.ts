import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';

export type IdeaDocument = IdeaSchemaDefinition & Document;

@Schema()
export class IdeaSchemaDefinition {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId | UserDocument;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  users: Types.ObjectId[] | UserDocument[];

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: () => Date.now() })
  createdAt: Date;

  @Prop({ default: () => Date.now(), index: true })
  updatedAt: Date;
}
export const IdeaSchema = SchemaFactory.createForClass(IdeaSchemaDefinition);
