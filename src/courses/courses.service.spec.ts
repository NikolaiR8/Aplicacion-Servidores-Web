import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../users/user-role.enum.js';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: {
            findAndCount: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a teacher updating another teacher course', async () => {
    const repository = vi.mocked(
      service['coursesRepository'],
    );
    repository.findOneBy.mockResolvedValue({
      id: 10,
      title: 'Nest',
      level: 'beginner',
      createdByUserId: 20,
    } as Course);

    await expect(
      service.update(
        '10',
        { title: 'Changed' },
        { id: 30, email: 'teacher@test.com', role: UserRole.TEACHER },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the owner teacher to update a course', async () => {
    const repository = vi.mocked(service['coursesRepository']);
    const course = {
      id: 10,
      title: 'Nest',
      level: 'beginner',
      createdByUserId: 30,
    } as Course;
    repository.findOneBy.mockResolvedValue(course);
    repository.save.mockResolvedValue(course);

    await service.update(
      '10',
      { title: 'Changed' },
      { id: 30, email: 'owner@test.com', role: UserRole.TEACHER },
    );

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Changed' }),
    );
  });
});
