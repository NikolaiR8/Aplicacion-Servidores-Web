import { IsString, IsEmail, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  age: number;

  @IsString()
  career: string;
  
  @IsInt()
  @Min(1)
  @Max(10)
  semester: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}