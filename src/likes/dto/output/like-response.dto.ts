import { ProjectResponseDto } from '../../../projects/dto/output/project-response.dto';
import { UserResponseDto } from '../../../users/dto/output/user-response.dto';

export class LikeResponseDto {
  likeId: string;
  user: string | UserResponseDto;
  project: string | ProjectResponseDto;
  timestamp: Date;
}
