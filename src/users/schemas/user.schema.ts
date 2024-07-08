import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Types } from 'mongoose';
import { IdeaDocument } from 'src/ideas/schemas/idea.schema';

export type UserDocument = UserSchemaDefinition & Document;

@Schema()
export class UserSchemaDefinition {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  })
  email: string;

  @Prop({ required: true, lowercase: true, index: true })
  username: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop()
  bio: string;

  @Prop()
  portfolioUrl: string;

  @Prop()
  skills: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }] })
  ideas: IdeaDocument[] | Types.ObjectId[];

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: () => Date.now() })
  createdAt: Date;

  @Prop({ default: () => Date.now(), index: true })
  updatedAt: Date;
}
export const UserSchema = SchemaFactory.createForClass(UserSchemaDefinition);
