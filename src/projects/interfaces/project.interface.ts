import { User } from '../../users/interfaces/user.interface';

export interface Project {
  projectId: string;
  title: string;
  description: string;
  creator: string | User;
  users: string[] | User[];
  joinRequests: string[] | User[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}
