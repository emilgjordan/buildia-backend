import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    tags?: string[]

    @IsOptional()
    @IsBoolean()
    public?: boolean;
}
