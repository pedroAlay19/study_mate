import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-user.dto';

export class UpdateStudentsDto extends PartialType(CreateStudentDto) {}
