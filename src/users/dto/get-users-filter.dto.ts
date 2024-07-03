import {
  IsOptional,
  IsString,
  IsBoolean,
  IsMongoId,
  IsEmail,
} from 'class-validator';

export class GetUsersFilterDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  readonly userId?: string;

  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsString()
  readonly bio?: string;

  @IsOptional()
  @IsString()
  readonly portfolioUrl?: string;

  @IsOptional()
  @IsString()
  readonly skills?: string[];

  @IsOptional()
  @IsString()
  readonly projects?: string[];

  @IsOptional()
  @IsBoolean()
  readonly isEmailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly isPremium?: boolean;

  @IsOptional()
  @IsString()
  readonly role?: string;

  @IsOptional()
  @IsString()
  readonly createdAt?: Date;

  @IsOptional()
  @IsString()
  readonly updatedAt?: Date;
}
