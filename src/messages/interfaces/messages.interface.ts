import { User } from '../../users/interfaces/user.interface';
import { Project } from '../../projects/interfaces/project.interface';

export interface Message {
  type: string;
  project: string | Project;
  user?: string | User;
  content: string;
  timestamp: Date;
}
