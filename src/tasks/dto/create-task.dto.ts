import { IsString, IsNotEmpty, IsDateString, IsUUID, IsEnum, ValidatorConstraint, ValidatorConstraintInterface, Validate, ValidationArguments } from 'class-validator';
import { TaskState, TaskPriority } from '../entities/task.entity';

// Validador personalizado: fecha de entrega no puede ser anterior a fecha de inicio
@ValidatorConstraint({ name: 'IsAfterStartDate', async: false })
export class IsAfterStartDate implements ValidatorConstraintInterface {
  validate(delivery_date: Date, args: ValidationArguments) {
    const obj = args.object as CreateTaskDto;
    const startDate = new Date(obj.start_date);
    const deliveryDate = new Date(delivery_date);
    return deliveryDate >= startDate;
  }

  defaultMessage() {
    return 'Delivery date must be equal to or after start date';
  }
}

// Validador personalizado: fecha de inicio no puede ser en el pasado
@ValidatorConstraint({ name: 'IsNotPastDate', async: false })
export class IsNotPastDate implements ValidatorConstraintInterface {
  validate(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate >= today;
  }

  defaultMessage() {
    return 'Start date cannot be in the past';
  }
}

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  @Validate(IsNotPastDate, {
    message: 'Start date cannot be in the past',
  })
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  @Validate(IsAfterStartDate, {
    message: 'Delivery date must be equal to or after start date',
  })
  delivery_date: Date;

  @IsEnum(TaskPriority)
  @IsNotEmpty()
  priority: TaskPriority;

  @IsEnum(TaskState)
  @IsNotEmpty()
  state: TaskState;
}