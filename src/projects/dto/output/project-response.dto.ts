import { UserResponseDto } from '../../../users/dto/output/user-response.dto';

export class ProjectResponseDto {
  projectId: string;
  title: string;
  description: string;
  creator: string | UserResponseDto;
  users: string[] | UserResponseDto[];
  tags: string[];
  public: boolean;
  createdAt: Date;
  updatedAt: Date;
}
