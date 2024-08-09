import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshTokenSchemaDefinition & Document;

@Schema()
export class RefreshTokenSchemaDefinition {
  @Prop({})
  userId: string;

  @Prop({ required: true })
  token: string;

  @Prop({ default: () => Date.now() })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;
}
export const RefreshTokenSchema = SchemaFactory.createForClass(
  RefreshTokenSchemaDefinition,
);
