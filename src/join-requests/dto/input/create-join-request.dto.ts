import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;
}
