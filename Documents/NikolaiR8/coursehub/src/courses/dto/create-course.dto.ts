import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level: string;
}
