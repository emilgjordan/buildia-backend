import { User } from '../../schemas/user.schema';
import { Types } from 'mongoose';
export const userStub = (): User & { _id: Types.ObjectId } => {
  return {
    firstName: 'Emil',
    lastName: 'Jordan',
    email: 'emiljordan@example.com',
    username: 'emiljordan',
    hashedPassword: 'password123',
    bio: 'This is a test bio',
    portfolioUrl: 'https://www.emiljordan.com',
    skills: ['javascript', 'typescript', 'nodejs', 'nestjs'],
    projects: ['project1', 'project2'],
    isEmailVerified: false,
    isPremium: false,
    role: 'user',
    createdAt: new Date(2006, 6, 23),
    updatedAt: new Date(2024, 2, 20),
    _id: new Types.ObjectId('507f191e810c19729de860ea'),
  };
};
