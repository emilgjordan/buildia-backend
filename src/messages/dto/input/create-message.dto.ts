import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
