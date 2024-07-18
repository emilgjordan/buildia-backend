import { ProjectResponseDto } from '../../../projects/dto/output/project-response.dto';

export class UserResponseDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  portfolioUrl: string;
  skills: string[];
  projects: string[] | ProjectResponseDto[];
  isEmailVerified: boolean;
  isPremium: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
