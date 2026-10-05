import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { Student } from '../students/entities/student.entity.js';
import { Course } from '../courses/entities/course.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';

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

  async findAll(studentId?: number, courseId?: number) {
    const qb = this.enrollmentsRepo.createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 'student')
      .leftJoinAndSelect('e.course', 'course');
      
    if (studentId) qb.andWhere('student.id = :studentId', { studentId });
    if (courseId) qb.andWhere('course.id = :courseId', { courseId });
    
    return await qb.getMany();
  }

  async findByStudent(studentId: number) {
    const student = await this.studentsRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException(`El estudiante con ID ${studentId} no existe`);
    return this.findAll(studentId, undefined);
  }

  async findByCourse(courseId: number) {
    const course = await this.coursesRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException(`El curso con ID ${courseId} no existe`);
    return this.findAll(undefined, courseId);
  }

  async remove(id: number) {
    const enrollment = await this.enrollmentsRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException(`La matrícula con ID ${id} no existe`);
    
    await this.enrollmentsRepo.remove(enrollment);
    return { message: 'Matrícula cancelada con éxito' };
  }
}