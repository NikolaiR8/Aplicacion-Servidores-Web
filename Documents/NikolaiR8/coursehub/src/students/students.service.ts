import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { FilterStudentDto } from './dto/filter-student.dto.js';
import { Student } from './entities/student.entity.js';

@Injectable()
export class StudentsService {
  // Base de datos en memoria
  private students: Student[] = [];
  private idCounter = 1;

  create(createStudentDto: CreateStudentDto) {
    const emailExists = this.students.find(s => s.email === createStudentDto.email);
    if (emailExists) {
      throw new ConflictException('El correo electrónico ya está registrado a otro estudiante');
    }

    const newStudent: Student = {
      id: this.idCounter++,
      ...createStudentDto,
      isActive: createStudentDto.isActive !== undefined ? createStudentDto.isActive : true,
    };
    
    this.students.push(newStudent);
    return newStudent;
  }

  findAll(filters: FilterStudentDto) {
    let result = this.students;

    if (filters.career) {
      result = result.filter(s => s.career === filters.career);
    }
    
    // CORRECCIÓN AQUÍ: Se añade "as string" para satisfacer el tipado estricto de TypeScript
    if (filters.semester) {
      result = result.filter(s => s.semester === parseInt(filters.semester as string, 10));
    }
    
    if (filters.isActive !== undefined) {
      const isActiveBool = filters.isActive === 'true';
      result = result.filter(s => s.isActive === isActiveBool);
    }

    return result;
  }

  findOne(id: number) {
    const student = this.students.find(s => s.id === id);
    if (!student) {
      throw new NotFoundException(`El estudiante con ID ${id} no existe`);
    }
    return student;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = this.findOne(id); // Reutilizamos findOne para que lance el error 404 si no existe
    
    if (updateStudentDto.email && updateStudentDto.email !== student.email) {
      const emailExists = this.students.find(s => s.email === updateStudentDto.email);
      if (emailExists) {
        throw new ConflictException('El nuevo correo electrónico ya está en uso por otro estudiante');
      }
    }

    const index = this.students.findIndex(s => s.id === id);
    // Hacemos un merge de la información, asegurando que el ID original no cambie
    this.students[index] = { ...student, ...updateStudentDto, id: student.id }; 
    return this.students[index];
  }

  changeStatus(id: number, isActive: boolean) {
    const student = this.findOne(id);
    student.isActive = isActive;
    return student;
  }

  remove(id: number) {
    const student = this.findOne(id);
    
    if (!student.isActive) {
      throw new BadRequestException('Regla de negocio: No se puede eliminar un estudiante que ya se encuentra inactivo');
    }
    
    this.students = this.students.filter(s => s.id !== id);
    return { message: 'Estudiante eliminado con éxito' };
  }
}