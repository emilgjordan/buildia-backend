import { UserResponseDto } from '../../dto/output/user-response.dto';

export const userResponseStub = (): UserResponseDto => {
  return {
    firstName: 'Emil',
    lastName: 'Jordan',
    email: 'emiljordan@example.com',
    username: 'emiljordan',
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
