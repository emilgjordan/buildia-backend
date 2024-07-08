import { User } from '../../interfaces/user.interface';
import * as bcrypt from 'bcryptjs';

export const updateUserStub = (): Partial<User> => {
  return {
    firstName: 'Johnny',
    lastName: 'Test',
    username: 'johnnytest',
    hashedPassword: bcrypt.hash('password123', 10),
    bio: 'Got a head of fiery hair, and a turbo-charged backpack',
    portfolioUrl: 'https://www.johnnytest.com',
    skills: ['mischief', 'saving-the-world'],
    ideas: [],
    isEmailVerified: false,
    isPremium: false,
    role: 'user',
    createdAt: new Date(2005, 9, 17),
    updatedAt: new Date(2014, 12, 25),
    userId: '507f191e810c19729de860ea',
  };
};
