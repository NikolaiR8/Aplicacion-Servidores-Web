import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { UpdateCourseUseCase } from './use-cases/update-course.use-case.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { UserRole } from '../users/user-role.enum.js';

describe('CoursesController', () => {
  let controller: CoursesController;
  const updateCourseUseCase = { execute: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: {
            findAll: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: UpdateCourseUseCase,
          useValue: updateCourseUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates the update id, DTO, and authenticated user to the use case', async () => {
    const actor = {
      id: 7,
      email: 'teacher@test.com',
      role: UserRole.TEACHER,
    };
    const dto = { title: 'Updated course' };
    const updatedCourse = { id: 12, ...dto };
    updateCourseUseCase.execute.mockResolvedValue(updatedCourse);

    await expect(
      controller.update(12, dto, { user: actor }),
    ).resolves.toEqual(updatedCourse);
    expect(updateCourseUseCase.execute).toHaveBeenCalledWith(12, dto, actor);
  });

  it('propagates errors from the update use case', async () => {
    const failure = new Error('Use case failed');
    updateCourseUseCase.execute.mockRejectedValue(failure);

    await expect(
      controller.update(
        12,
        { title: 'Updated course' },
        {
          user: {
            id: 7,
            email: 'teacher@test.com',
            role: UserRole.TEACHER,
          },
        },
      ),
    ).rejects.toBe(failure);
  });
});
