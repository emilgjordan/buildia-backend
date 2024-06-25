import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  userId: string;

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

  @Prop()
  projects: string[];

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

export const UserSchema = SchemaFactory.createForClass(User);
