import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Student } from './entities/user.entity';
import { CreateStudentDto } from './dto/create-user.dto';
import { UpdateStudentsDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<Student>;

  const mockStudent = {
    studentId: 'student-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<Student>>(getRepositoryToken(Student));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear estudiante', () => {
    it('debería crear un nuevo estudiante', async () => {
      const createStudentDto: CreateStudentDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockStudent);
      mockRepository.save.mockResolvedValue(mockStudent);

      const result = await service.create(createStudentDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ 
        email: 'john@example.com' 
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createStudentDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockStudent);
      expect(result).toEqual(mockStudent);
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const createStudentDto: CreateStudentDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockRepository.findOneBy.mockResolvedValue(mockStudent);

      await expect(service.create(createStudentDto)).rejects.toThrow(
        new ConflictException('Student with email john@example.com already exists'),
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debería manejar errores del repositorio durante la creación', async () => {
      const createStudentDto: CreateStudentDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };

      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockStudent);
      mockRepository.save.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.create(createStudentDto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('encontrar todos los estudiantes', () => {
    it('debería retornar un array de estudiantes', async () => {
      const students = [mockStudent];
      mockRepository.find.mockResolvedValue(students);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(students);
    });

    it('debería retornar array vacío cuando no existen estudiantes', async () => {
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

  describe('encontrar un estudiante', () => {
    it('debería retornar un estudiante por ID', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStudent);

      const result = await service.findOne('student-1');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        studentId: 'student-1',
      });
      expect(result).toEqual(mockStudent);
    });

    it('debería lanzar NotFoundException si no encuentra el estudiante', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Student with ID 999 not found'),
      );
    });

    it('debería manejar IDs vacíos o inválidos', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(null as any)).rejects.toThrow();
      await expect(service.findOne(undefined as any)).rejects.toThrow();
    });
  });

  describe('actualizar estudiante', () => {
    it('debería actualizar un estudiante', async () => {
      const updateStudentDto: UpdateStudentsDto = {
        name: 'Jane Doe',
      };

      const updatedStudent = { ...mockStudent, ...updateStudentDto };

      mockRepository.findOneBy.mockResolvedValue(mockStudent);
      mockRepository.save.mockResolvedValue(updatedStudent);

      const result = await service.update('student-1', updateStudentDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        studentId: 'student-1',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedStudent);
      expect(result).toEqual(updatedStudent);
    });

    it('debería lanzar NotFoundException si no encuentra el estudiante', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('999', { name: 'Jane Doe' }),
      ).rejects.toThrow(new NotFoundException('Student with ID 999 not found'));
    });

    it('debería actualizar múltiples campos a la vez', async () => {
      const updateStudentDto: UpdateStudentsDto = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'newPassword123',
      };

      const updatedStudent = { ...mockStudent, ...updateStudentDto };

      mockRepository.findOneBy.mockResolvedValue(mockStudent);
      mockRepository.save.mockResolvedValue(updatedStudent);

      const result = await service.update('student-1', updateStudentDto);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect(result.name).toBe('Jane Smith');
        expect(result.email).toBe('jane.smith@example.com');
        expect(result.password).toBe('newPassword123');
      }
    });
  });

  describe('eliminar estudiante', () => {
    it('debería eliminar un estudiante', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStudent);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('student-1');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        studentId: 'student-1',
      });
      expect(mockRepository.delete).toHaveBeenCalledWith('student-1');
      expect(result).toEqual({ affected: 1 });
    });

    it('debería lanzar NotFoundException si no encuentra el estudiante', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(
        new NotFoundException('Student with ID 999 not found'),
      );
    });
  });

  describe('validaciones de entrada', () => {
    describe('validación de campos requeridos', () => {
      it('debería lanzar BadRequestException si falta el nombre', async () => {
        const createStudentDtoWithoutName = {
          email: 'john@example.com',
          password: 'password123',
        };

        await expect(service.create(createStudentDtoWithoutName as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createStudentDtoWithoutName as any)).rejects.toThrow(
          'Name is required'
        );
      });

      it('debería lanzar BadRequestException si falta el email', async () => {
        const createStudentDtoWithoutEmail = {
          name: 'John Doe',
          password: 'password123',
        };

        await expect(service.create(createStudentDtoWithoutEmail as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createStudentDtoWithoutEmail as any)).rejects.toThrow(
          'Email is required'
        );
      });

      it('debería lanzar BadRequestException si falta la contraseña', async () => {
        const createStudentDtoWithoutPassword = {
          name: 'John Doe',
          email: 'john@example.com',
        };

        await expect(service.create(createStudentDtoWithoutPassword as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createStudentDtoWithoutPassword as any)).rejects.toThrow(
          'Password is required'
        );
      });
    });

    describe('validación de longitud y contenido', () => {
      it('debería lanzar BadRequestException si el nombre es muy largo', async () => {
        const createStudentDto: CreateStudentDto = {
          name: 'A'.repeat(101),
          email: 'john@example.com',
          password: 'password123',
        };

        await expect(service.create(createStudentDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createStudentDto)).rejects.toThrow(
          'Name is too long'
        );
      });

      it('debería lanzar BadRequestException si el nombre contiene caracteres inválidos', async () => {
        const invalidNames = [
          'John@Doe',
          'Jane/*',
          'Student123',
          'User#$%',
        ];

        for (const invalidName of invalidNames) {
          const createStudentDto: CreateStudentDto = {
            name: invalidName,
            email: 'test@example.com',
            password: 'password123',
          };

          await expect(service.create(createStudentDto)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.create(createStudentDto)).rejects.toThrow(
            'Name contains invalid characters'
          );
        }
      });

      it('debería aceptar nombres válidos', async () => {
        const validNames = [
          'John Doe',
          'María García',
          'José María de la Cruz'
        ];

        for (const validName of validNames) {
          const createStudentDto: CreateStudentDto = {
            name: validName,
            email: `${validName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            password: 'password123',
          };

          const validStudent = { ...mockStudent, name: validName };

          mockRepository.findOneBy.mockResolvedValue(null);
          mockRepository.create.mockReturnValue(validStudent);
          mockRepository.save.mockResolvedValue(validStudent);

          const result = await service.create(createStudentDto);
          expect(result.name).toBe(validName);
        }
      });
    });

    describe('validación de email', () => {
      it('debería lanzar BadRequestException para formatos de email inválidos', async () => {
        const invalidEmails = [
          'invalid-email',
          'test@',
          '@example.com',
          'test..test@example.com',
          'test with spaces@example.com',
        ];

        for (const invalidEmail of invalidEmails) {
          const createStudentDto: CreateStudentDto = {
            name: 'John Doe',
            email: invalidEmail,
            password: 'password123',
          };

          await expect(service.create(createStudentDto)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.create(createStudentDto)).rejects.toThrow(
            'Email format is invalid'
          );
        }
      });

      it('debería aceptar formatos de email válidos', async () => {
        const validEmails = [
          'john@example.com',
          'jane.doe@university.edu',
          'test+tag@example.org',
        ];

        for (const validEmail of validEmails) {
          const createStudentDto: CreateStudentDto = {
            name: 'Test Student',
            email: validEmail,
            password: 'password123',
          };

          const validStudent = { ...mockStudent, email: validEmail };

          mockRepository.findOneBy.mockResolvedValue(null);
          mockRepository.create.mockReturnValue(validStudent);
          mockRepository.save.mockResolvedValue(validStudent);

          const result = await service.create(createStudentDto);
          expect(result.email).toBe(validEmail);
        }
      });
    });

    describe('validación de contraseña', () => {
      it('debería lanzar BadRequestException si la contraseña es muy corta', async () => {
        const createStudentDto: CreateStudentDto = {
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        };

        await expect(service.create(createStudentDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createStudentDto)).rejects.toThrow(
          'Password must be at least 8 characters long'
        );
      });

      it('debería lanzar BadRequestException si la contraseña es muy larga', async () => {
        const createStudentDto: CreateStudentDto = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'A'.repeat(129),
        };

        await expect(service.create(createStudentDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createStudentDto)).rejects.toThrow(
          'Password is too long'
        );
      });

      it('debería lanzar BadRequestException si la contraseña carece de complejidad', async () => {
        const weakPasswords = [
          'password',
          '12345678',
          'PASSWORD',
        ];

        for (const weakPassword of weakPasswords) {
          const createStudentDto: CreateStudentDto = {
            name: 'John Doe',
            email: 'john@example.com',
            password: weakPassword,
          };

          await expect(service.create(createStudentDto)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.create(createStudentDto)).rejects.toThrow(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          );
        }
      });

      it('debería aceptar contraseñas seguras', async () => {
        const strongPasswords = [
          'Password123!',
          'MySecure@Pass1',
          'StrongP@ssw0rd',
        ];

        for (const strongPassword of strongPasswords) {
          const createStudentDto: CreateStudentDto = {
            name: 'Test Student',
            email: 'test@example.com',
            password: strongPassword,
          };

          const validStudent = { ...mockStudent, password: strongPassword };

          mockRepository.findOneBy.mockResolvedValue(null);
          mockRepository.create.mockReturnValue(validStudent);
          mockRepository.save.mockResolvedValue(validStudent);

          const result = await service.create(createStudentDto);
          expect(result.password).toBe(strongPassword);
        }
      });
    });

    describe('casos límite', () => {
      it('debería manejar caracteres especiales permitidos en nombres', async () => {
        const createStudentDto: CreateStudentDto = {
          name: 'José María de la Cruz-Martínez',
          email: 'jose.maria@example.com',
          password: 'password123',
        };

        const studentWithSpecialName = { ...mockStudent, name: createStudentDto.name };

        mockRepository.findOneBy.mockResolvedValue(null);
        mockRepository.create.mockReturnValue(studentWithSpecialName);
        mockRepository.save.mockResolvedValue(studentWithSpecialName);

        const result = await service.create(createStudentDto);

        expect(result.name).toBe('José María de la Cruz-Martínez');
      });

      it('debería manejar longitudes mínimas válidas', async () => {
        const createStudentDto: CreateStudentDto = {
          name: 'A',
          email: 'a@b.co',
          password: 'Pass123!',
        };

        const minimalStudent = { ...mockStudent, ...createStudentDto };

        mockRepository.findOneBy.mockResolvedValue(null);
        mockRepository.create.mockReturnValue(minimalStudent);
        mockRepository.save.mockResolvedValue(minimalStudent);

        const result = await service.create(createStudentDto);

        expect(result.name).toBe('A');
        expect(result.email).toBe('a@b.co');
      });
    });
  });
});