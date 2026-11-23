import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCourseDto } from '../dto/update-course.dto.js';
import { Course } from '../entities/course.entity.js';
import { COURSE_REPOSITORY } from '../courses.repository.js';
import type { CourseRepository } from '../courses.repository.js';
import { AuthenticatedUser } from '../../auth/authenticated-user.interface.js';
import { UserRole } from '../../users/user-role.enum.js';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courses: CourseRepository,
  ) {}

  async execute(
    id: number,
    changes: UpdateCourseDto,
    actor: AuthenticatedUser,
  ): Promise<Course> {
    const course = await this.courses.findById(id);
    if (!course) throw new NotFoundException(`Course ${id} not found`);

    const canManageAny = actor.role === UserRole.ADMIN;
    const isOwner = course.createdByUserId === actor.id;
    if (!canManageAny && !isOwner) {
      throw new ForbiddenException('You cannot modify this course');
    }

    Object.assign(course, changes);
    return this.courses.save(course);
  }
}
