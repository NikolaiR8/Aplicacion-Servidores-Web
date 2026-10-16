import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';
import { Course } from './entities/course.entity.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  async findAll(query: CoursesQueryDto = new CoursesQueryDto()) {
    const { level, page = 1, limit = 10, sortBy = 'id', order = 'ASC' } = query;
    const [items, total] = await this.coursesRepository.findAndCount({
      where: level ? { level } : {},
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
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

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOneBy({ id: Number(id) });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  create(dto: CreateCourseDto) {
    const course = this.coursesRepository.create(dto);
    return this.coursesRepository.save(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id);
    Object.assign(course, dto);
    return this.coursesRepository.save(course);
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
    return course;
  }
}