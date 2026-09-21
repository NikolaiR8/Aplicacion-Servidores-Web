import { IsOptional, IsString } from 'class-validator';

export class FilterStudentDto {
  @IsOptional()
  @IsString()
  career?: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsString()
  isActive?: string;
}