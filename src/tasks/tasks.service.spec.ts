import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskState, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockSubject = {
    subjectId: 'subject-1',
    name: 'Mathematics',
    assignedTeacher: 'Dr. Smith',
  };

  const mockTask = {
    task_id: '1',
    title: 'Test Task',
    description: 'Test Description',
    start_date: new Date('2024-12-01'),
    delivery_date: new Date('2024-12-15'),
    priority: TaskPriority.HIGH,
    state: TaskState.PENDING,
    subject: mockSubject,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear tarea', () => {
    it('debería crear una nueva tarea', async () => {
      const createTaskDto: CreateTaskDto = {
        subjectId: 'subject-1',
        title: 'Test Task',
        description: 'Test Description',
        start_date: new Date('2024-12-01'),
        delivery_date: new Date('2024-12-15'),
        priority: TaskPriority.HIGH,
        state: TaskState.PENDING,
      };

      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });

    it('debería manejar errores del repositorio durante la creación', async () => {
      const createTaskDto: CreateTaskDto = {
        subjectId: 'subject-1',
        title: 'Test Task',
        description: 'Test Description',
        start_date: new Date('2024-12-01'),
        delivery_date: new Date('2024-12-15'),
        priority: TaskPriority.MEDIUM,
        state: TaskState.PENDING,
      };

      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.create(createTaskDto)).rejects.toThrow('Database connection failed');
    });

    it('debería crear tarea con diferentes prioridades y estados', async () => {
      const priorityStateCombinations = [
        { priority: TaskPriority.LOW, state: TaskState.PENDING },
        { priority: TaskPriority.MEDIUM, state: TaskState.IN_PROGRESS },
        { priority: TaskPriority.HIGH, state: TaskState.COMPLETED },
        { priority: TaskPriority.URGENT, state: TaskState.CANCELLED },
      ];

      for (const { priority, state } of priorityStateCombinations) {
        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'Test Description',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority,
          state,
        };

        const taskWithPriorityState = { ...mockTask, priority, state };

        mockRepository.create.mockReturnValue(taskWithPriorityState);
        mockRepository.save.mockResolvedValue(taskWithPriorityState);

        const result = await service.create(createTaskDto);
        expect(result.priority).toBe(priority);
        expect(result.state).toBe(state);
      }
    });
  });

  describe('encontrar todas las tareas', () => {
    it('debería retornar un array de tareas', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['subject'],
      });
      expect(result).toEqual(tasks);
    });

    it('debería retornar array vacío cuando no existen tareas', async () => {
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

  describe('encontrar una tarea', () => {
    it('debería retornar una tarea por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { task_id: '1' },
        relations: ['subject'],
      });
      expect(result).toEqual(mockTask);
    });

    it('debería lanzar NotFoundException si no encuentra la tarea', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(
        new NotFoundException('Task with ID 999 not found'),
      );
    });

    it('debería manejar IDs vacíos o inválidos', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(null as any)).rejects.toThrow();
      await expect(service.findOne(undefined as any)).rejects.toThrow();
    });
  });

  describe('encontrar tareas por materia', () => {
    it('debería retornar tareas por ID de materia', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findBySubject('subject-1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { subject: { subjectId: 'subject-1' } },
        relations: ['subject'],
      });
      expect(result).toEqual(tasks);
    });

    it('debería retornar array vacío cuando no existen tareas para la materia', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findBySubject('nonexistent-subject');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('actualizar tarea', () => {
    it('debería actualizar una tarea', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateTaskDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { task_id: '1' },
        relations: ['subject'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedTask);
      expect(result).toEqual(updatedTask);
    });

    it('debería lanzar NotFoundException si no encuentra la tarea', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', { title: 'Updated Task' }),
      ).rejects.toThrow(new NotFoundException('Task with ID 999 not found'));
    });

    it('debería actualizar múltiples campos a la vez', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        priority: TaskPriority.URGENT,
        state: TaskState.IN_PROGRESS,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateTaskDto);

      expect(result.title).toBe('Updated Task');
      expect(result.description).toBe('Updated Description');
      expect(result.priority).toBe(TaskPriority.URGENT);
      expect(result.state).toBe(TaskState.IN_PROGRESS);
    });
  });

  describe('eliminar tarea', () => {
    it('debería eliminar una tarea', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      await service.remove('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { task_id: '1' },
        relations: ['subject'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('debería lanzar NotFoundException si no encuentra la tarea', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(
        new NotFoundException('Task with ID 999 not found'),
      );
    });
  });

  describe('validaciones de entrada', () => {
    describe('validación de campos requeridos', () => {
      it('debería lanzar BadRequestException si falta el título', async () => {
        const createTaskDtoWithoutTitle = {
          subjectId: 'subject-1',
          description: 'Test Description',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDtoWithoutTitle as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createTaskDtoWithoutTitle as any)).rejects.toThrow(
          'Title is required'
        );
      });

      it('debería lanzar BadRequestException si falta la descripción', async () => {
        const createTaskDtoWithoutDescription = {
          subjectId: 'subject-1',
          title: 'Test Task',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDtoWithoutDescription as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createTaskDtoWithoutDescription as any)).rejects.toThrow(
          'Description is required'
        );
      });

      it('debería lanzar BadRequestException si falta el ID de la materia', async () => {
        const createTaskDtoWithoutSubject = {
          title: 'Test Task',
          description: 'Test Description',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDtoWithoutSubject as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createTaskDtoWithoutSubject as any)).rejects.toThrow(
          'Subject ID is required'
        );
      });

      it('debería lanzar BadRequestException si falta la fecha de inicio', async () => {
        const createTaskDtoWithoutStartDate = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'Test Description',
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDtoWithoutStartDate as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createTaskDtoWithoutStartDate as any)).rejects.toThrow(
          'Start date is required'
        );
      });

      it('debería lanzar BadRequestException si falta la fecha de entrega', async () => {
        const createTaskDtoWithoutDeliveryDate = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'Test Description',
          start_date: new Date('2024-12-01'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDtoWithoutDeliveryDate as any)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createTaskDtoWithoutDeliveryDate as any)).rejects.toThrow(
          'Delivery date is required'
        );
      });
    });

    describe('validación de longitud y contenido', () => {
      it('debería lanzar BadRequestException si el título es muy largo', async () => {
        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: 'A'.repeat(201),
          description: 'Test Description',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createTaskDto)).rejects.toThrow(
          'Title is too long'
        );
      });

      it('debería lanzar BadRequestException si la descripción es muy larga', async () => {
        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'A'.repeat(1001),
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDto)).rejects.toThrow(
          BadRequestException
        );
        await expect(service.create(createTaskDto)).rejects.toThrow(
          'Description is too long'
        );
      });

      it('debería lanzar BadRequestException si el título contiene caracteres inválidos', async () => {
        const invalidTitles = [
          'Task@123',
          'Task/*',
          'Task#$%',
          'Task<script>',
        ];

        for (const invalidTitle of invalidTitles) {
          const createTaskDto: CreateTaskDto = {
            subjectId: 'subject-1',
            title: invalidTitle,
            description: 'Test Description',
            start_date: new Date('2024-12-01'),
            delivery_date: new Date('2024-12-15'),
            priority: TaskPriority.HIGH,
            state: TaskState.PENDING,
          };

          await expect(service.create(createTaskDto)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.create(createTaskDto)).rejects.toThrow(
            'Title contains invalid characters'
          );
        }
      });

      it('debería aceptar títulos y descripciones válidos', async () => {
        const validCombinations = [
          { title: 'Mathematics Homework', description: 'Complete exercises 1-10' },
          { title: 'Science Project', description: 'Research renewable energy sources' },
          { title: 'English Essay', description: 'Write a 500-word essay about literature' },
        ];

        for (const { title, description } of validCombinations) {
          const createTaskDto: CreateTaskDto = {
            subjectId: 'subject-1',
            title,
            description,
            start_date: new Date('2024-12-01'),
            delivery_date: new Date('2024-12-15'),
            priority: TaskPriority.MEDIUM,
            state: TaskState.PENDING,
          };

          const validTask = { ...mockTask, title, description };

          mockRepository.create.mockReturnValue(validTask);
          mockRepository.save.mockResolvedValue(validTask);

          const result = await service.create(createTaskDto);
          expect(result.title).toBe(title);
          expect(result.description).toBe(description);
        }
      });
    });

    describe('validación de fechas', () => {
      it('debería lanzar BadRequestException si la fecha de entrega es anterior a la de inicio', async () => {
        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'Test Description',
          start_date: new Date('2024-12-15'),
          delivery_date: new Date('2024-12-10'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDto)).rejects.toThrow(BadRequestException);
        await expect(service.create(createTaskDto)).rejects.toThrow(
          'Delivery date cannot be before start date'
        );
      });

      it('debería lanzar BadRequestException si la fecha de inicio está en el pasado', async () => {
        const pastDate = new Date('2023-01-01');
        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'Test Description',
          start_date: pastDate,
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDto)).rejects.toThrow(BadRequestException);
        await expect(service.create(createTaskDto)).rejects.toThrow(
          'Start date cannot be in the past'
        );
      });

      it('debería aceptar rangos de fechas válidos', async () => {
        const validDateCombinations = [
          { start: new Date('2024-12-01'), delivery: new Date('2024-12-15') },
          { start: new Date('2024-12-10'), delivery: new Date('2024-12-10') },
          { start: new Date('2025-01-01'), delivery: new Date('2025-01-31') },
        ];

        for (const { start, delivery } of validDateCombinations) {
          const createTaskDto: CreateTaskDto = {
            subjectId: 'subject-1',
            title: 'Valid Task',
            description: 'Valid Description',
            start_date: start,
            delivery_date: delivery,
            priority: TaskPriority.MEDIUM,
            state: TaskState.PENDING,
          };

          const validTask = { ...mockTask, start_date: start, delivery_date: delivery };

          mockRepository.create.mockReturnValue(validTask);
          mockRepository.save.mockResolvedValue(validTask);

          const result = await service.create(createTaskDto);
          expect(result.start_date).toEqual(start);
          expect(result.delivery_date).toEqual(delivery);
        }
      });
    });

    describe('validación de enums', () => {
      it('debería lanzar BadRequestException para valores de prioridad inválidos', async () => {
        const createTaskDto = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'Test Description',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: 'INVALID_PRIORITY',
          state: TaskState.PENDING,
        };

        await expect(service.create(createTaskDto as any)).rejects.toThrow(BadRequestException);
        await expect(service.create(createTaskDto as any)).rejects.toThrow(
          'Invalid priority value'
        );
      });

      it('debería lanzar BadRequestException para valores de estado inválidos', async () => {
        const createTaskDto = {
          subjectId: 'subject-1',
          title: 'Test Task',
          description: 'Test Description',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.HIGH,
          state: 'INVALID_STATE',
        };

        await expect(service.create(createTaskDto as any)).rejects.toThrow(BadRequestException);
        await expect(service.create(createTaskDto as any)).rejects.toThrow(
          'Invalid state value'
        );
      });

      it('debería aceptar todas las combinaciones de enums válidas', async () => {
        const allPriorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT];
        const allStates = [TaskState.PENDING, TaskState.IN_PROGRESS, TaskState.COMPLETED, TaskState.CANCELLED];

        for (const priority of allPriorities) {
          for (const state of allStates) {
            const createTaskDto: CreateTaskDto = {
              subjectId: 'subject-1',
              title: 'Enum Test Task',
              description: 'Testing enum combinations',
              start_date: new Date('2024-12-01'),
              delivery_date: new Date('2024-12-15'),
              priority,
              state,
            };

            const enumTask = { ...mockTask, priority, state };

            mockRepository.create.mockReturnValue(enumTask);
            mockRepository.save.mockResolvedValue(enumTask);

            const result = await service.create(createTaskDto);
            expect(result.priority).toBe(priority);
            expect(result.state).toBe(state);
          }
        }
      });
    });

    describe('casos límite', () => {
      it('debería manejar caracteres especiales permitidos en títulos', async () => {
        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: 'Math Assignment: Chapter 1 & 2 (Review)',
          description: 'Complete all exercises in chapters 1 and 2',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.MEDIUM,
          state: TaskState.PENDING,
        };

        const taskWithSpecialChars = { ...mockTask, title: createTaskDto.title };

        mockRepository.create.mockReturnValue(taskWithSpecialChars);
        mockRepository.save.mockResolvedValue(taskWithSpecialChars);

        const result = await service.create(createTaskDto);

        expect(result.title).toBe('Math Assignment: Chapter 1 & 2 (Review)');
      });

      it('debería manejar longitudes mínimas válidas', async () => {
        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: 'A',
          description: 'B',
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-01'),
          priority: TaskPriority.LOW,
          state: TaskState.PENDING,
        };

        const minimalTask = { ...mockTask, title: 'A', description: 'B' };

        mockRepository.create.mockReturnValue(minimalTask);
        mockRepository.save.mockResolvedValue(minimalTask);

        const result = await service.create(createTaskDto);

        expect(result.title).toBe('A');
        expect(result.description).toBe('B');
      });

      it('debería manejar longitudes máximas válidas', async () => {
        const maxTitle = 'A'.repeat(200);
        const maxDescription = 'B'.repeat(1000);

        const createTaskDto: CreateTaskDto = {
          subjectId: 'subject-1',
          title: maxTitle,
          description: maxDescription,
          start_date: new Date('2024-12-01'),
          delivery_date: new Date('2024-12-15'),
          priority: TaskPriority.URGENT,
          state: TaskState.IN_PROGRESS,
        };

        const maximalTask = { ...mockTask, title: maxTitle, description: maxDescription };

        mockRepository.create.mockReturnValue(maximalTask);
        mockRepository.save.mockResolvedValue(maximalTask);

        const result = await service.create(createTaskDto);

        expect(result.title).toHaveLength(200);
        expect(result.description).toHaveLength(1000);
      });
    });
  });
});