import { User } from 'src/users/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';

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
