import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { Student } from '../students/entities/student.entity.js';
import { Course } from '../courses/entities/course.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private enrollmentsRepo: Repository<Enrollment>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Course) private coursesRepo: Repository<Course>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { studentId, courseId } = createEnrollmentDto;

    // 1. Validar que el estudiante exista y esté activo
    const student = await this.studentsRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException(`El estudiante con ID ${studentId} no existe`);
    if (!student.isActive) throw new BadRequestException(`El estudiante con ID ${studentId} no está activo`);

    // 2. Validar que el curso exista
    const course = await this.coursesRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException(`El curso con ID ${courseId} no existe`);

    // 3. Validar que no exista matrícula duplicada
    const existing = await this.enrollmentsRepo.findOne({ 
      where: { student: { id: studentId }, course: { id: courseId } } 
    });
    if (existing) throw new ConflictException('El estudiante ya está matriculado en este curso');

    // 4. Guardar en PostgreSQL
    const newEnrollment = this.enrollmentsRepo.create({ student, course });
    return await this.enrollmentsRepo.save(newEnrollment);
  }

  async findAll(query: EnrollmentsQueryDto = new EnrollmentsQueryDto()) {
    const {
      search,
      studentId,
      courseId,
      activeOnly,
      page = 1,
      limit = 10,
    } = query;

    const qb = this.enrollmentsRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course');

    if (search && search.trim()) {
      qb.andWhere('(student.name ILIKE :search OR course.title ILIKE :search)', {
        search: `%${search.trim()}%`,
      });
    }

    if (studentId) {
      qb.andWhere('student.id = :studentId', { studentId });
    }

    if (courseId) {
      qb.andWhere('course.id = :courseId', { courseId });
    }

    if (activeOnly === 'true') {
      qb.andWhere('student.isActive = :active', { active: true });
    }

    qb.orderBy('enrollment.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByStudent(studentId: number) {
    const student = await this.studentsRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException(`El estudiante con ID ${studentId} no existe`);
    const result = await this.findAll({ studentId, page: 1, limit: 50 });
    return result.items;
  }

  async findByCourse(courseId: number) {
    const course = await this.coursesRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException(`El curso con ID ${courseId} no existe`);
    const result = await this.findAll({ courseId, page: 1, limit: 50 });
    return result.items;
  }

  async remove(id: number) {
    const enrollment = await this.enrollmentsRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException(`La matrícula con ID ${id} no existe`);
    
    await this.enrollmentsRepo.remove(enrollment);
    return { message: 'Matrícula cancelada con éxito' };
  }
}