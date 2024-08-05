import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';
import { ProjectDocument } from '../../projects/schemas/project.schema';

export type LikeDocument = LikeSchemaDefinition & Document;

@Schema()
export class LikeSchemaDefinition {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId | UserDocument;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  })
  project: Types.ObjectId | ProjectDocument;

  @Prop({ default: () => Date.now() })
  timestamp: Date;
}
export const LikeSchema = SchemaFactory.createForClass(LikeSchemaDefinition);
