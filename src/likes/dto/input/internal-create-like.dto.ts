import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class InternalCreateLikeDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;
}
