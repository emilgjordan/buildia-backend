import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';
import { ProjectDocument } from '../../projects/schemas/project.schema';

export type JoinRequestDocument = JoinRequestSchemaDefinition & Document;

@Schema()
export class JoinRequestSchemaDefinition {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | UserDocument;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  })
  project: Types.ObjectId | ProjectDocument;

  @Prop({ default: false })
  approved: boolean;

  @Prop({ default: () => Date.now() })
  createdAt: Date;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ default: false })
  hidden: boolean;
}
export const JoinRequestSchema = SchemaFactory.createForClass(
  JoinRequestSchemaDefinition,
);
