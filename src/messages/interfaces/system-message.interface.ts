import { Project } from '../../projects/interfaces/project.interface';
import { Message } from './message.interface';

export interface SystemMessage extends Message {
  messageId: string;
  type: 'system';
  project: string | Project;
  content: string;
  timestamp: Date;
}
