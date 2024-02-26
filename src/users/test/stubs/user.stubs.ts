import { User } from '../../schemas/user.schema';
import { Types } from 'mongoose';
export const userStub = (): User & { _id: Types.ObjectId } => {
  return {
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    createdAt: new Date(2006, 6, 23),
    updatedAt: new Date(2024, 2, 20),
    _id: new Types.ObjectId('507f191e810c19729de860ea'),
  };
};

export const updatedUserStub = (): User & { _id: Types.ObjectId } => {
  return {
    ...userStub(),
    name: 'Updated Name',
  };
};
