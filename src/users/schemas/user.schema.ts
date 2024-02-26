import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

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
  password: string;

  @Prop({ default: () => Date.now() })
  createdAt: Date;

  @Prop({ default: () => Date.now(), index: true })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
