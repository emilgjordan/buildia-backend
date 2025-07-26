
import { Type } from 'class-transformer';
import { IsOptional, IsInt } from 'class-validator';

export class GetProjectsDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    userId?: number;
}