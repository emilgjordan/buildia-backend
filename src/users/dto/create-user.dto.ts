import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly username: string;
}
