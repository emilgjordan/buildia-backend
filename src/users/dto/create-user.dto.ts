import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @MinLength(8)
    password: string;
}
