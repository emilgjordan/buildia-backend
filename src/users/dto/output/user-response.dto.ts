export class UserResponseDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  portfolioUrl: string;
  skills: string[];
  projects: string[];
  isEmailVerified: boolean;
  isPremium: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
