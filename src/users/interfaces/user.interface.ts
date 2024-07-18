import { Project } from '../../projects/interfaces/project.interface';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  hashedPassword: string;
  bio: string;
  portfolioUrl: string;
  skills: string[];
  projects: string[] | Project[];
  isEmailVerified: boolean;
  isPremium: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
