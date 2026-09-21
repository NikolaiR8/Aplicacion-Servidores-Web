import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { StudentsService } from '../students/students.service.js';
import { CoursesService } from '../courses/courses.service.js';

type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};

@Injectable()
export class EnrollmentsService {
  private readonly enrollments: Enrollment[] = [];
  private nextId = 1;

  constructor(
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  create(createEnrollmentDto: CreateEnrollmentDto) {
    const { studentId, courseId } = createEnrollmentDto;

    // 1. Validar que el estudiante exista (findOne ya lanza 404 si no existe)
    const student = this.studentsService.findOne(studentId);
    
    // 2. Validar que el estudiante esté activo
    if (!student.isActive) {
      throw new BadRequestException(`El estudiante con ID ${studentId} no está activo`);
    }

    // 3. Validar que el curso exista
    const course = this.coursesService.findOne(courseId);
    if (!course) {
      throw new NotFoundException(`El curso con ID ${courseId} no existe`);
    }

    // 4. Validar que no exista matrícula duplicada
    const isEnrolled = this.enrollments.find(
      (e) => e.studentId === studentId && e.courseId === courseId
    );
    if (isEnrolled) {
      throw new ConflictException(`El estudiante ya está matriculado en este curso`);
    }

    const newEnrollment: Enrollment = {
      id: this.nextId++,
      studentId,
      courseId,
    };
    
    this.enrollments.push(newEnrollment);
    return newEnrollment;
  }

  findAll(studentId?: number, courseId?: number) {
    let result = this.enrollments;
    if (studentId) result = result.filter((e) => e.studentId === studentId);
    if (courseId) result = result.filter((e) => e.courseId === courseId);
    return result;
  }

  findByStudent(studentId: number) {
    this.studentsService.findOne(studentId); // Valida que exista el estudiante
    return this.findAll(studentId, undefined);
  }

  findByCourse(courseId: number) {
    const course = this.coursesService.findOne(courseId);
    if (!course) throw new NotFoundException(`El curso con ID ${courseId} no existe`);
    return this.findAll(undefined, courseId);
  }

  remove(id: number) {
    const index = this.enrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`La matrícula con ID ${id} no existe`);
    }
    const [removed] = this.enrollments.splice(index, 1);
    return removed;
  }
}