import { User } from '../../users/interfaces/user.interface';

export interface Project {
  projectId: string;
  title: string;
  description: string;
  creator: string | User;
  users: string[] | User[];
  tags: string[];
  likes: number;
  public: boolean;
  createdAt: Date;
  updatedAt: Date;
}
