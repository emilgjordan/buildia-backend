import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;
}
