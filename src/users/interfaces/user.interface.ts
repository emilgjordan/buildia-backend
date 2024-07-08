import { IdeaDocument } from 'src/ideas/schemas/idea.schema';

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
  ideas: string[] | IdeaDocument[];
  isEmailVerified: boolean;
  isPremium: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
