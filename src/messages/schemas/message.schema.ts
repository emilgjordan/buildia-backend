import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';
import { ProjectDocument } from '../../projects/schemas/project.schema';

export type MessageDocument = MessageSchemaDefinition & Document;

@Schema()
export class MessageSchemaDefinition {
  @Prop({ required: true })
  type: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  })
  project: Types.ObjectId | ProjectDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user?: Types.ObjectId | UserDocument;

  @Prop({ required: true })
  content: string;

  @Prop({ default: () => Date.now() })
  timestamp: Date;
}
export const MessageSchema = SchemaFactory.createForClass(
  MessageSchemaDefinition,
);
