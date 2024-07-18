import { IsNotEmpty, IsString } from 'class-validator';

export class JoinProjectDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
