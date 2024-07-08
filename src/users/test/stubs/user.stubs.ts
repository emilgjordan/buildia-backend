import { UserDocument, UserSchemaDefinition } from '../../schemas/user.schema';
import { User } from '../../interfaces/user.interface';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../../dto/input/create-user.dto';
import { userStub } from './user.stub';

//deal with this
export const createUserRepositoryDataStub = (): UserSchemaDefinition => {
  const user = userStub();
  const { userId, ideas, ...rest } = user;
  return {
    ideas: ideas.map((ideaId) => Types.ObjectId.createFromHexString(ideaId)),
    ...rest,
  };
};
