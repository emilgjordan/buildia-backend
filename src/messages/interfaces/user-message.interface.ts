import { User } from '../../users/interfaces/user.interface';
import { Project } from '../../projects/interfaces/project.interface';
import { Message } from './message.interface';

export interface UserMessage extends Message {
  messageId: string;
  type: 'user';
  project: string | Project;
  user: string | User;
  content: string;
  timestamp: Date;
}
