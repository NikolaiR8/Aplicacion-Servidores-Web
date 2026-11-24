import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { AppModule } from '../src/app.module.js';
import { HttpErrorFilter } from '../src/common/filters/http-error.filter.js';
import { TimingInterceptor } from '../src/common/interceptors/timing.interceptor.js';
import { Course } from '../src/courses/entities/course.entity.js';
import { Enrollment } from '../src/enrollments/entities/enrollment.entity.js';
import { User } from '../src/users/entities/user.entity.js';
import { UserRole } from '../src/users/user-role.enum.js';

describe('CourseHub API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let users: Repository<User>;
  let courses: Repository<Course>;
  let jwtService: JwtService;
  let courseId: number;
  let ownerToken: string;
  let otherTeacherToken: string;

  async function clearTestData(): Promise<void> {
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(Enrollment)
      .execute();
    await dataSource.createQueryBuilder().delete().from(Course).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpErrorFilter());
    app.useGlobalInterceptors(new TimingInterceptor());
    await app.init();

    dataSource = app.get(DataSource);
    users = dataSource.getRepository(User);
    courses = dataSource.getRepository(Course);
    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    await clearTestData();

    const owner = await users.save(
      users.create({
        email: 'owner@e2e.test',
        passwordHash: 'not-used-by-these-tests',
        role: UserRole.TEACHER,
      }),
    );
    const otherTeacher = await users.save(
      users.create({
        email: 'other-teacher@e2e.test',
        passwordHash: 'not-used-by-these-tests',
        role: UserRole.TEACHER,
      }),
    );
    const course = await courses.save(
      courses.create({
        title: 'E2E course',
        level: 'beginner',
        createdBy: owner,
      }),
    );

    courseId = course.id;
    ownerToken = jwtService.sign({
      sub: owner.id,
      email: owner.email,
      role: owner.role,
    });
    otherTeacherToken = jwtService.sign({
      sub: otherTeacher.id,
      email: otherTeacher.email,
      role: otherTeacher.role,
    });
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await clearTestData();
    }
    await app?.close();
  });

  it('returns the seeded courses from the public endpoint', async () => {
    const response = await request(app.getHttpServer())
      .get('/courses')
      .expect(200);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: courseId, title: 'E2E course' }),
      ]),
    );
  });

  it('rejects a protected update without a JWT', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/courses/${courseId}`)
      .send({ title: 'Unauthorized update' })
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      path: `/courses/${courseId}`,
    });
  });

  it('rejects a teacher updating another teacher course', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${otherTeacherToken}`)
      .send({ title: 'Foreign course update' })
      .expect(403);

    expect(response.body).toMatchObject({
      statusCode: 403,
      message: 'You cannot modify this course',
    });
  });

  it('allows the owner teacher to update the course', async () => {
    await request(app.getHttpServer())
      .patch(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated E2E course' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('Updated E2E course');
      });

    const updatedCourse = await courses.findOneByOrFail({ id: courseId });
    expect(updatedCourse.title).toBe('Updated E2E course');
  });
});
