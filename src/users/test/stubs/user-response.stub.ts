import { UserResponseDto } from '../../dto/output/user-response.dto';

export const userResponseStub = (): UserResponseDto => {
  return {
    firstName: 'Johnny',
    lastName: 'Test',
    email: 'johnnytest@example.com',
    username: 'johnnytest',
    bio: 'Got a head of fiery hair, and a turbo-charged backpack',
    portfolioUrl: 'https://www.johnnytest.com',
    skills: ['mischief', 'saving-the-world'],
    projects: ['experiment', 'battle'],
    isEmailVerified: false,
    isPremium: false,
    role: 'user',
    createdAt: new Date(2005, 9, 17),
    updatedAt: new Date(2014, 12, 25),
    userId: '507f191e810c19729de860ea',
  };
};
