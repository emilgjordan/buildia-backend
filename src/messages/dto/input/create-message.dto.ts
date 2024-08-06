import { IsIn, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'system'])
  type: 'user' | 'system';

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
