import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { UsersService } from '../users/users.service';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let repository: Repository<Subject>;
  let usersService: UsersService;

  const mockStudent = {
    studentId: 'student-1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockSubject = {
    subjectId: 'subject-1',
    name: 'Mathematics',
    assignedTeacher: 'Dr. Smith',
    schedule: [
      { day: 'Monday', start: '08:00', end: '10:00' }
    ],
    color: '#FF5733',
    student: mockStudent,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: getRepositoryToken(Subject),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    repository = module.get<Repository<Subject>>(getRepositoryToken(Subject));
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear materia', () => {
    it('debería crear una nueva materia', async () => {
      const createSubjectDto: CreateSubjectDto = {
        studentId: 'student-1',
        name: 'Mathematics',
        assignedTeacher: 'Dr. Smith',
        schedule: [],
        color: '#FF5733',
      };

      mockUsersService.findOne.mockResolvedValue(mockStudent);
      mockRepository.create.mockReturnValue(mockSubject);
      mockRepository.save.mockResolvedValue(mockSubject);

      const result = await service.create(createSubjectDto);

      expect(mockUsersService.findOne).toHaveBeenCalledWith('student-1');
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createSubjectDto,
        student: mockStudent,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockSubject);
      expect(result).toEqual(mockSubject);
    });

    it('debería lanzar NotFoundException cuando el estudiante no existe', async () => {
      const createSubjectDto: CreateSubjectDto = {
        studentId: 'nonexistent-student',
        name: 'Mathematics',
        assignedTeacher: 'Dr. Smith',
        schedule: [],
        color: '#FF5733',
      };

      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('Student with ID nonexistent-student not found')
      );

      await expect(service.create(createSubjectDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debería manejar errores del repositorio durante la creación', async () => {
      const createSubjectDto: CreateSubjectDto = {
        studentId: 'student-1',
        name: 'Mathematics',
        assignedTeacher: 'Dr. Smith',
        schedule: [],
        color: '#FF5733',
      };

      mockUsersService.findOne.mockResolvedValue(mockStudent);
      mockRepository.create.mockReturnValue(mockSubject);
      mockRepository.save.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.create(createSubjectDto)).rejects.toThrow('Database connection failed');
    });

    it('debería crear materia con horario complejo', async () => {
      const complexSchedule = [
        { day: 'Monday', start: '08:00', end: '10:00' },
        { day: 'Wednesday', start: '14:00', end: '16:00' },
        { day: 'Friday', start: '10:00', end: '12:00' }
      ];

      const createSubjectDto: CreateSubjectDto = {
        studentId: 'student-1',
        name: 'Advanced Mathematics',
        assignedTeacher: 'Dr. Smith',
        schedule: complexSchedule,
        color: '#FF5733',
      };

      const subjectWithComplexSchedule = { ...mockSubject, schedule: complexSchedule };

      mockUsersService.findOne.mockResolvedValue(mockStudent);
      mockRepository.create.mockReturnValue(subjectWithComplexSchedule);
      mockRepository.save.mockResolvedValue(subjectWithComplexSchedule);

      const result = await service.create(createSubjectDto);

      expect(result.schedule).toEqual(complexSchedule);
    });
  });

  describe('encontrar todas las materias', () => {
    it('debería retornar un array de materias', async () => {
      const subjects = [mockSubject];
      mockRepository.find.mockResolvedValue(subjects);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(subjects);
    });

    it('debería retornar array vacío cuando no existen materias', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería manejar errores del repositorio', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('encontrar una materia', () => {
    it('debería retornar una materia por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockSubject);

      const result = await service.findOne('subject-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subjectId: 'subject-1' },
      });
      expect(result).toEqual(mockSubject);
    });

    it('debería lanzar NotFoundException si no encuentra la materia', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Subject with id 999 not found'),
      );
    });

    it('debería manejar IDs vacíos o inválidos', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(null as any)).rejects.toThrow();
      await expect(service.findOne(undefined as any)).rejects.toThrow();
    });
  });

  describe('actualizar materia', () => {
    it('debería actualizar una materia', async () => {
      const updateSubjectDto: UpdateSubjectDto = {
        name: 'Updated Mathematics',
      };

      const updatedSubject = { ...mockSubject, ...updateSubjectDto };

      mockRepository.findOne.mockResolvedValue(mockSubject);
      mockRepository.save.mockResolvedValue(updatedSubject);

      const result = await service.update('subject-1', updateSubjectDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subjectId: 'subject-1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedSubject);
      expect(result).toEqual(updatedSubject);
    });

    it('debería lanzar error al intentar reasignar estudiante', async () => {
      const updateSubjectDto: UpdateSubjectDto = {
        studentId: 'new-student-id',
      };

      mockRepository.findOne.mockResolvedValue(mockSubject);

      await expect(
        service.update('subject-1', updateSubjectDto),
      ).rejects.toThrow('The student cannot be reassigned');
    });

    it('debería lanzar NotFoundException si no encuentra la materia', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', { name: 'Updated Subject' }),
      ).rejects.toThrow(new NotFoundException('Subject with id 999 not found'));
    });

    it('debería actualizar múltiples campos a la vez', async () => {
      const updateSubjectDto: UpdateSubjectDto = {
        name: 'Physics',
        assignedTeacher: 'Dr. Einstein',
        color: '#00FF00',
        schedule: [{ day: 'Tuesday', start: '10:00', end: '12:00' }]
      };

      const updatedSubject = { ...mockSubject, ...updateSubjectDto };

      mockRepository.findOne.mockResolvedValue(mockSubject);
      mockRepository.save.mockResolvedValue(updatedSubject);

      const result = await service.update('subject-1', updateSubjectDto);

      expect(result.name).toBe('Physics');
      expect(result.assignedTeacher).toBe('Dr. Einstein');
      expect(result.color).toBe('#00FF00');
    });
  });

  describe('eliminar materia', () => {
    it('debería eliminar una materia', async () => {
      mockRepository.findOne.mockResolvedValue(mockSubject);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('subject-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subjectId: 'subject-1' },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith('subject-1');
      expect(result).toEqual({ affected: 1 });
    });

    it('debería lanzar NotFoundException si no encuentra la materia', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(
        new NotFoundException('Subject with id 999 not found'),
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('validaciones de entrada', () => {
    describe('validación de campos requeridos', () => {
      it('debería lanzar BadRequestException si falta el nombre', async () => {
        const createSubjectDtoWithoutName = {
          studentId: 'student-1',
          assignedTeacher: 'Dr. Smith',
          schedule: [],
          color: '#FF5733',
        };

        await expect(service.create(createSubjectDtoWithoutName as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDtoWithoutName as any)).rejects.toThrow(
          'Name is required'
        );
      });

      it('debería lanzar BadRequestException si falta el profesor asignado', async () => {
        const createSubjectDtoWithoutTeacher = {
          studentId: 'student-1',
          name: 'Mathematics',
          schedule: [],
          color: '#FF5733',
        };

        await expect(service.create(createSubjectDtoWithoutTeacher as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDtoWithoutTeacher as any)).rejects.toThrow(
          'Assigned teacher is required'
        );
      });

      it('debería lanzar BadRequestException si falta el ID del estudiante', async () => {
        const createSubjectDtoWithoutStudent = {
          name: 'Mathematics',
          assignedTeacher: 'Dr. Smith',
          schedule: [],
          color: '#FF5733',
        };

        await expect(service.create(createSubjectDtoWithoutStudent as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDtoWithoutStudent as any)).rejects.toThrow(
          'Student ID is required'
        );
      });

      it('debería lanzar BadRequestException si falta el color', async () => {
        const createSubjectDtoWithoutColor = {
          studentId: 'student-1',
          name: 'Mathematics',
          assignedTeacher: 'Dr. Smith',
          schedule: [],
        };

        await expect(service.create(createSubjectDtoWithoutColor as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDtoWithoutColor as any)).rejects.toThrow(
          'Color is required'
        );
      });
    });

    describe('validación de longitud y contenido', () => {
      it('debería lanzar BadRequestException si el nombre es muy largo', async () => {
        const createSubjectDto: CreateSubjectDto = {
          studentId: 'student-1',
          name: 'A'.repeat(101),
          assignedTeacher: 'Dr. Smith',
          schedule: [],
          color: '#FF5733',
        };

        mockUsersService.findOne.mockResolvedValue(mockStudent);

        await expect(service.create(createSubjectDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDto)).rejects.toThrow(
          'Name is too long'
        );
      });

      it('debería lanzar BadRequestException si el nombre del profesor es muy largo', async () => {
        const createSubjectDto: CreateSubjectDto = {
          studentId: 'student-1',
          name: 'Mathematics',
          assignedTeacher: 'Dr. ' + 'A'.repeat(100),
          schedule: [],
          color: '#FF5733',
        };

        mockUsersService.findOne.mockResolvedValue(mockStudent);

        await expect(service.create(createSubjectDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDto)).rejects.toThrow(
          'Assigned teacher name is too long'
        );
      });

      it('debería lanzar BadRequestException si el nombre contiene caracteres inválidos', async () => {
        const invalidNames = [
          'Math@matics',
          'Physics/*',
          'Chemistry123#',
          'Biology@*/',
        ];

        for (const invalidName of invalidNames) {
          const createSubjectDto: CreateSubjectDto = {
            studentId: 'student-1',
            name: invalidName,
            assignedTeacher: 'Dr. Smith',
            schedule: [],
            color: '#FF5733',
          };

          mockUsersService.findOne.mockResolvedValue(mockStudent);

          await expect(service.create(createSubjectDto)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.create(createSubjectDto)).rejects.toThrow(
            'Name contains invalid characters'
          );
        }
      });

      it('debería aceptar nombres y profesores válidos', async () => {
        const validCombinations = [
          { name: 'Mathematics', teacher: 'Dr. Smith' },
          { name: 'Physical Education', teacher: 'Prof. Johnson' },
          { name: 'Art & Design', teacher: 'Ms. Brown' },
        ];

        for (const { name, teacher } of validCombinations) {
          const createSubjectDto: CreateSubjectDto = {
            studentId: 'student-1',
            name: name,
            assignedTeacher: teacher,
            schedule: [],
            color: '#FF5733',
          };

          const validSubject = { ...mockSubject, name, assignedTeacher: teacher };

          mockUsersService.findOne.mockResolvedValue(mockStudent);
          mockRepository.findOne.mockResolvedValue(null);
          mockRepository.create.mockReturnValue(validSubject);
          mockRepository.save.mockResolvedValue(validSubject);

          const result = await service.create(createSubjectDto);
          expect(result.name).toBe(name);
          expect(result.assignedTeacher).toBe(teacher);
        }
      });
    });

    describe('validación de formato de color', () => {
      it('debería lanzar BadRequestException para formatos de color inválidos', async () => {
        const invalidColors = [
          'invalid-color',
          '#GGGGGG',
          '#12345',
          'rgb(256,256,256)',
          'red',
        ];

        for (const invalidColor of invalidColors) {
          const createSubjectDto: CreateSubjectDto = {
            studentId: 'student-1',
            name: 'Mathematics',
            assignedTeacher: 'Dr. Smith',
            schedule: [],
            color: invalidColor,
          };

          mockUsersService.findOne.mockResolvedValue(mockStudent);

          await expect(service.create(createSubjectDto)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.create(createSubjectDto)).rejects.toThrow(
            'Color format is invalid'
          );
        }
      });

      it('debería aceptar formatos de color válidos', async () => {
        const validColors = [
          '#FF5733',
          '#ABC',
          '#123456',
          '#000000',
        ];

        for (const validColor of validColors) {
          const createSubjectDto: CreateSubjectDto = {
            studentId: 'student-1',
            name: 'Art',
            assignedTeacher: 'Prof. Color',
            schedule: [],
            color: validColor,
          };

          const subjectWithColor = { ...mockSubject, color: validColor };

          mockUsersService.findOne.mockResolvedValue(mockStudent);
          mockRepository.findOne.mockResolvedValue(null);
          mockRepository.create.mockReturnValue(subjectWithColor);
          mockRepository.save.mockResolvedValue(subjectWithColor);

          const result = await service.create(createSubjectDto);
          expect(result.color).toBe(validColor);
        }
      });
    });

    describe('validación de horarios', () => {
      it('debería lanzar BadRequestException para formatos de hora inválidos', async () => {
        const invalidTimeFormats = [
          { day: 'Monday', start: '25:00', end: '10:00' },
          { day: 'Tuesday', start: '08:60', end: '10:00' },
          { day: 'Wednesday', start: '8:00', end: '10:00' },
        ];

        for (const invalidScheduleItem of invalidTimeFormats) {
          const createSubjectDto: CreateSubjectDto = {
            studentId: 'student-1',
            name: 'Mathematics',
            assignedTeacher: 'Dr. Smith',
            schedule: [invalidScheduleItem],
            color: '#FF5733',
          };

          mockUsersService.findOne.mockResolvedValue(mockStudent);

          await expect(service.create(createSubjectDto)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.create(createSubjectDto)).rejects.toThrow(
            'Schedule times must be in HH:mm format'
          );
        }
      });

      it('debería lanzar BadRequestException para horarios superpuestos', async () => {
        const overlappingSchedule = [
          { day: 'Monday', start: '08:00', end: '10:00' },
          { day: 'Monday', start: '09:00', end: '11:00' },
        ];

        const createSubjectDto: CreateSubjectDto = {
          studentId: 'student-1',
          name: 'Physics',
          assignedTeacher: 'Dr. Overlap',
          schedule: overlappingSchedule,
          color: '#FF5733',
        };

        mockUsersService.findOne.mockResolvedValue(mockStudent);

        await expect(service.create(createSubjectDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDto)).rejects.toThrow(
          'Schedule items overlap'
        );
      });

      it('debería lanzar BadRequestException si el horario excede el límite máximo', async () => {
        const tooManyScheduleItems = Array.from({ length: 11 }, (_, i) => ({
          day: 'Monday',
          start: `${8 + i}:00`,
          end: `${8 + i}:30`,
        }));

        const createSubjectDto: CreateSubjectDto = {
          studentId: 'student-1',
          name: 'Intensive Course',
          assignedTeacher: 'Dr. Busy',
          schedule: tooManyScheduleItems,
          color: '#FF5733',
        };

        mockUsersService.findOne.mockResolvedValue(mockStudent);

        await expect(service.create(createSubjectDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createSubjectDto)).rejects.toThrow(
          'A subject cannot have more than 10 schedule items'
        );
      });

      it('debería aceptar formatos de horario válidos', async () => {
        const validSchedules = [
          [],
          [{ day: 'Monday', start: '08:00', end: '10:00' }],
          [
            { day: 'Monday', start: '08:00', end: '09:30' },
            { day: 'Wednesday', start: '14:00', end: '15:30' },
          ],
        ];

        for (const validSchedule of validSchedules) {
          const createSubjectDto: CreateSubjectDto = {
            studentId: 'student-1',
            name: 'Valid Course',
            assignedTeacher: 'Dr. Valid',
            schedule: validSchedule,
            color: '#FF5733',
          };

          const subjectWithValidSchedule = { ...mockSubject, schedule: validSchedule };

          mockUsersService.findOne.mockResolvedValue(mockStudent);
          mockRepository.findOne.mockResolvedValue(null);
          mockRepository.create.mockReturnValue(subjectWithValidSchedule);
          mockRepository.save.mockResolvedValue(subjectWithValidSchedule);

          const result = await service.create(createSubjectDto);
          expect(result.schedule).toEqual(validSchedule);
        }
      });
    });

    describe('casos límite', () => {
      it('debería manejar caracteres especiales permitidos en nombres', async () => {
        const createSubjectDto: CreateSubjectDto = {
          studentId: 'student-1',
          name: 'Art & Design: Theory and Practice',
          assignedTeacher: 'Dr. García',
          schedule: [],
          color: '#FF5733',
        };

        const subjectWithSpecialChars = { ...mockSubject, name: createSubjectDto.name };

        mockUsersService.findOne.mockResolvedValue(mockStudent);
        mockRepository.findOne.mockResolvedValue(null);
        mockRepository.create.mockReturnValue(subjectWithSpecialChars);
        mockRepository.save.mockResolvedValue(subjectWithSpecialChars);

        const result = await service.create(createSubjectDto);

        expect(result.name).toBe('Art & Design: Theory and Practice');
      });

      it('debería manejar horario vacío válido', async () => {
        const createSubjectDto: CreateSubjectDto = {
          studentId: 'student-1',
          name: 'Flexible Course',
          assignedTeacher: 'Dr. Flexible',
          schedule: [],
          color: '#FF5733',
        };

        const subjectWithEmptySchedule = { ...mockSubject, schedule: [] };

        mockUsersService.findOne.mockResolvedValue(mockStudent);
        mockRepository.findOne.mockResolvedValue(null);
        mockRepository.create.mockReturnValue(subjectWithEmptySchedule);
        mockRepository.save.mockResolvedValue(subjectWithEmptySchedule);

        const result = await service.create(createSubjectDto);

        expect(result.schedule).toEqual([]);
      });
    });
  });
});