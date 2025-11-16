import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from '@supabase/supabase-js';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,

    private readonly studentsService: UsersService,
  ) {}
  async create(createSubjectDto: CreateSubjectDto, user: JwtPayload) {
    const student = await this.studentsService.findOne(user.sub);
    const subject = this.subjectsRepository.create({
      ...createSubjectDto,
      student,
    });
    return await this.subjectsRepository.save(subject);
  }

  async findAll(user: JwtPayload): Promise<Subject[]> {
    return await this.subjectsRepository.find({
      where: { student: { studentId: user.sub } },
    });
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { subjectId: id },
    });
    if (!subject) throw new NotFoundException(`Subject with id ${id} not found`);
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.findOne(id);    
    Object.assign(subject, updateSubjectDto);
    return await this.subjectsRepository.save(subject);

  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.subjectsRepository.delete(id);
  }
}
