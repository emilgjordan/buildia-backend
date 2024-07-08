import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly username?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly lastName?: string;

  @IsString()
  @IsOptional()
  readonly bio?: string;

  @IsString()
  @IsOptional()
  readonly portfolioUrl?: string;

  @IsString({ each: true })
  @IsOptional()
  readonly skills?: string[];
}
