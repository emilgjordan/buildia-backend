import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class InternalCreateJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;
}
