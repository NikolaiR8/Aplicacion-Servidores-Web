import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { COURSE_REPOSITORY } from './courses.repository.js';
import { TypeOrmCourseRepository } from './typeorm-course.repository.js';
import { UpdateCourseUseCase } from './use-cases/update-course.use-case.js';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), AuthModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    UpdateCourseUseCase,
    {
      provide: COURSE_REPOSITORY,
      useClass: TypeOrmCourseRepository,
    },
  ],
  exports: [CoursesService], 
})
export class CoursesModule {}