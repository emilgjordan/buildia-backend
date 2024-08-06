import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class InternalCreateMessageDto {
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
  @IsOptional()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
