import { ProjectResponseDto } from 'src/projects/dto/output/project-response.dto';
import { UserResponseDto } from 'src/users/dto/output/user-response.dto';

export class MessageResponseDto {
  messageId: string;
  type: string;
  project: string | ProjectResponseDto;
  user?: string | UserResponseDto;
  content: string;
  timestamp: Date;
}
