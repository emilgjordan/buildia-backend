import { User } from '../../users/interfaces/user.interface';
import { Project } from '../../projects/interfaces/project.interface';

export interface JoinRequest {
  joinRequestId: string;
  user: string | User;
  project: string | Project;
  approved: boolean;
  createdAt: Date;
  approvedAt: Date | null;
  hidden: boolean;
}
