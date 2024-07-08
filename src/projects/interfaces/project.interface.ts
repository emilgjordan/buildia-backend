import { User } from '../../users/interfaces/user.interface';

export interface Project {
  projectId: string;
  title: string;
  description: string;
  owner: string | User;
  users: string[] | User[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}
