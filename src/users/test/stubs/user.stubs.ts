import { UserDocument, UserSchemaDefinition } from '../../schemas/user.schema';
import { User } from '../../interfaces/user.interface';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../../dto/create-user.dto';

export const userStub = (): User => {
  return {
    firstName: 'Emil',
    lastName: 'Jordan',
    email: 'emiljordan@example.com',
    username: 'emiljordan',
    hashedPassword: bcrypt.hash('password123', 10),
    bio: 'This is a test bio',
    portfolioUrl: 'https://www.emiljordan.com',
    skills: ['javascript', 'typescript', 'nodejs', 'nestjs'],
    projects: ['project1', 'project2'],
    isEmailVerified: false,
    isPremium: false,
    role: 'user',
    createdAt: new Date(2006, 6, 23),
    updatedAt: new Date(2024, 2, 20),
    userId: '507f191e810c19729de860ea',
  };
};

export const createUserDtoStub = (): CreateUserDto => {
  return {
    firstName: 'Emil',
    lastName: 'Jordan',
    email: 'emiljordan@example.com',
    username: 'emiljordan',
    password: 'password123',
  };
};

export const createUserRepositoryDataStub = (): UserSchemaDefinition => {
  const user = userStub();
  const { userId, ...rest } = user;
  return {
    ...rest,
  };
};

export const userDocumentStub = (): Partial<UserDocument> => {
  const user = userStub();
  const { userId, ...rest } = user;
  return {
    _id: Types.ObjectId.createFromHexString(userId),
    __v: 0,
    toObject: function () {
      const { _id, __v, ...plainUser } = this;
      return this;
    },
    ...rest,
  };
};
