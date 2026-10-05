import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { FilterStudentDto } from './dto/filter-student.dto.js';
import { Student } from './entities/student.entity.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const emailExists = await this.studentsRepository.findOne({ where: { email: createStudentDto.email } });
    if (emailExists) {
      throw new ConflictException('El correo electrónico ya está registrado a otro estudiante');
    }

    const newStudent = this.studentsRepository.create({
      ...createStudentDto,
      isActive: createStudentDto.isActive !== undefined ? createStudentDto.isActive : true,
    });
    
    return await this.studentsRepository.save(newStudent);
  }

  async findAll(filters: FilterStudentDto): Promise<Student[]> {
    const query = this.studentsRepository.createQueryBuilder('student');

    if (filters.career) {
      query.andWhere('student.career = :career', { career: filters.career });
    }
    
    if (filters.semester) {
      query.andWhere('student.semester = :semester', { semester: parseInt(filters.semester as string, 10) });
    }
    
    if (filters.isActive !== undefined) {
      const isActiveBool = filters.isActive === 'true';
      query.andWhere('student.isActive = :isActive', { isActive: isActiveBool });
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`El estudiante con ID ${id} no existe`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id); 
    
    if (updateStudentDto.email && updateStudentDto.email !== student.email) {
      const emailExists = await this.studentsRepository.findOne({ where: { email: updateStudentDto.email } });
      if (emailExists) {
        throw new ConflictException('El nuevo correo electrónico ya está en uso por otro estudiante');
      }
    }

    const updatedStudent = this.studentsRepository.merge(student, updateStudentDto);
    return await this.studentsRepository.save(updatedStudent);
  }

  async changeStatus(id: number, isActive: boolean): Promise<Student> {
    const student = await this.findOne(id);
    student.isActive = isActive;
    return await this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<{ message: string }> {
    const student = await this.findOne(id);
    
    if (!student.isActive) {
      throw new BadRequestException('Regla de negocio: No se puede eliminar un estudiante que ya se encuentra inactivo');
    }
    
    await this.studentsRepository.remove(student);
    return { message: 'Estudiante eliminado con éxito' };
  }
}