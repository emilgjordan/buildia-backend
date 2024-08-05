import { User } from '../../users/interfaces/user.interface';
import { Project } from '../../projects/interfaces/project.interface';

export interface Like {
  likeId: string;
  user: string | User;
  project: string | Project;
  timestamp: Date;
}
