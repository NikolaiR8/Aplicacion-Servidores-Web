import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCourseUseCase } from './update-course.use-case.js';
import type { CourseRepository } from '../courses.repository.js';
import { UserRole } from '../../users/user-role.enum.js';

describe('UpdateCourseUseCase', () => {
  const owner = { id: 7, email: 'teacher@test.com', role: UserRole.TEACHER };

  it('returns 404 when the course does not exist', async () => {
    const repository: CourseRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      remove: vi.fn(),
    };
    const useCase = new UpdateCourseUseCase(repository);

    await expect(
      useCase.execute(99, { title: 'Changed' }, owner),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects a teacher that does not own the course', async () => {
    const course = {
      id: 1,
      title: 'Nest',
      level: 'beginner',
      createdByUserId: 12,
    };
    const repository: CourseRepository = {
      findById: vi.fn().mockResolvedValue(course),
      save: vi.fn(),
      remove: vi.fn(),
    };
    const useCase = new UpdateCourseUseCase(repository);

    await expect(
      useCase.execute(1, { title: 'Changed' }, owner),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('allows the owner to update', async () => {
    const course = {
      id: 1,
      title: 'Nest',
      level: 'beginner',
      createdByUserId: 7,
    };
    const repository: CourseRepository = {
      findById: vi.fn().mockResolvedValue(course),
      save: vi.fn().mockImplementation(async (value) => value),
      remove: vi.fn(),
    };
    const useCase = new UpdateCourseUseCase(repository);

    const result = await useCase.execute(
      1,
      { title: 'Updated' },
      owner,
    );
    expect(result.title).toBe('Updated');
    expect(repository.save).toHaveBeenCalledWith(course);
  });

  it('allows an admin to update a course owned by someone else', async () => {
    const course = {
      id: 1,
      title: 'Nest',
      level: 'beginner',
      createdByUserId: 12,
    };
    const repository: CourseRepository = {
      findById: vi.fn().mockResolvedValue(course),
      save: vi.fn().mockImplementation(async (value) => value),
      remove: vi.fn(),
    };
    const useCase = new UpdateCourseUseCase(repository);
    const admin = { id: 99, email: 'admin@test.com', role: UserRole.ADMIN };

    await expect(
      useCase.execute(1, { title: 'Admin update' }, admin),
    ).resolves.toMatchObject({ title: 'Admin update' });
    expect(repository.save).toHaveBeenCalledOnce();
  });
});
