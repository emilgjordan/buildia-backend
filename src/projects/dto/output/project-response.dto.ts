import { UserResponseDto } from '../../../users/dto/output/user-response.dto';

export class ProjectResponseDto {
  projectId: string;
  title: string;
  description: string;
  owner: string | UserResponseDto;
  users: string[] | UserResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
