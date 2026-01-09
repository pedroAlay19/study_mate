# Factory Pattern - Implementación en Módulo de Alertas

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [¿Qué es el Factory Pattern?](#qué-es-el-factory-pattern)
3. [Estructura de la Implementación](#estructura-de-la-implementación)
4. [Componentes Detallados](#componentes-detallados)
5. [Flujo de Ejecución](#flujo-de-ejecución)
6. [Razones de la Aplicación](#razones-de-la-aplicación)
7. [Ventajas y Beneficios](#ventajas-y-beneficios)
8. [Diagramas](#diagramas)

---

## Introducción

En el módulo de **alertas** (`backend/src/alerts/`) de tu aplicación Study Mate, se ha implementado el **Factory Pattern** (Patrón de Fábrica) para la creación de diferentes tipos de alertas. Este patrón es una solución de diseño que encapsula la lógica de creación de objetos, permitiendo que el sistema sea más flexible, mantenible y escalable.

---

## ¿Qué es el Factory Pattern?

### Definición Técnica

El **Factory Pattern** es un patrón creacional de diseño que proporciona una interfaz para crear objetos sin especificar sus clases concretas. En lugar de instanciar directamente las clases, se utiliza una "fábrica" que encapsula la lógica de creación y devuelve la instancia apropiada.

### Objetivo Principal

- **Desacoplar** la creación de objetos de su uso
- **Centralizar** la lógica de creación
- **Permitir** extensibilidad sin modificar código existente
- **Reducir** la complejidad en el código cliente

### Tipos de Factory Pattern

Existen varias variantes:

1. **Simple Factory**: Una clase que crea diferentes tipos de objetos basados en parámetros
2. **Factory Method**: Una interfaz para crear objetos, dejando que las subclases decidan qué crear
3. **Abstract Factory**: Crea familias de objetos relacionados

En tu caso, se implementó una combinación de **Simple Factory con Factory Method**.

---

## Estructura de la Implementación

### Árbol de Archivos

```
backend/src/alerts/
├── factories/
│   ├── alert-factory.interface.ts          # Define contrato para factories
│   ├── alert-factory.ts                    # Factory principal (orquestador)
│   ├── urgent-alert.factory.ts             # Factory para alertas urgentes
│   ├── warning-alert.factory.ts            # Factory para alertas de advertencia
│   └── reminder-alert.factory.ts           # Factory para recordatorios
├── types/
│   └── alert-types.enum.ts                 # Enumeraciones de tipos y severidad
├── entities/
│   └── alert.entity.ts                     # Entidad de base de datos
├── alerts.service.ts                       # Servicio que usa las factories
├── alerts.controller.ts                    # Controlador
└── alerts.module.ts                        # Módulo NestJS
```

---

## Componentes Detallados

### 1. **alert-factory.interface.ts** - Contrato de Interfaz

```typescript
import { Task } from '../../tasks/entities/task.entity';
import { AlertType, AlertSeverity } from '../types/alert-types.enum';

export interface CreateAlertData {
  message: string;
  alertType: AlertType;
  severity: AlertSeverity;
}

export interface IAlertFactory {
  createAlertData(task: Task, daysUntilDue?: number): CreateAlertData;
}
```

**Responsabilidad**: Define el contrato que todas las factories específicas deben cumplir.

**Componentes**:
- `CreateAlertData`: Interfaz que define la estructura de datos que retorna una alerta
  - `message`: El texto del mensaje de alerta
  - `alertType`: Tipo de alerta (URGENT, WARNING, REMINDER)
  - `severity`: Nivel de severidad (LOW, MEDIUM, HIGH)

- `IAlertFactory`: Interfaz que establece que toda factory debe implementar el método `createAlertData()`

**Ventaja**: Garantiza que todas las implementaciones concretas sigan un contrato consistente.

---

### 2. **alert-factory.ts** - Factory Principal (Orquestador)

```typescript
@Injectable()
export class AlertFactory {
  constructor(
    private readonly urgentFactory: UrgentAlertFactory,
    private readonly warningFactory: WarningAlertFactory,
    private readonly reminderFactory: ReminderAlertFactory,
  ) {}

  /**
   * Decide qué factory usar según los días restantes hasta el vencimiento
   */
  private getFactory(daysUntilDue: number): IAlertFactory {
    if (daysUntilDue === 0) {
      return this.urgentFactory;
    } else if (daysUntilDue <= 2) {
      return this.warningFactory;
    } else if (daysUntilDue <= 5) {
      return this.reminderFactory;
    }
    
    return this.reminderFactory;
  }

  createAlert(task: Task, daysUntilDue: number): CreateAlertData {
    const factory = this.getFactory(daysUntilDue);
    return factory.createAlertData(task, daysUntilDue);
  }
}
```

**Responsabilidad**: Orquesta la selección y delegación a la factory apropiada.

**Lógica de Decisión**:
- **0 días**: Usa `UrgentAlertFactory` → AlertType.URGENT, Severity.HIGH
- **1-2 días**: Usa `WarningAlertFactory` → AlertType.WARNING, Severity.MEDIUM/HIGH
- **3-5 días**: Usa `ReminderAlertFactory` → AlertType.REMINDER, Severity.LOW/MEDIUM
- **Cualquier otro caso**: Por defecto usa `ReminderAlertFactory`

**Patrón Aplicado**: **Strategy Pattern** combinado con **Factory Pattern** para elegir la estrategia de creación según el contexto.

---

### 3. **Factories Específicas**

#### **urgent-alert.factory.ts**

```typescript
@Injectable()
export class UrgentAlertFactory implements IAlertFactory {
  createAlertData(task: Task): CreateAlertData {
    const isHighPriority = task.priority === TaskPriority.HIGH;
    
    const emoji = isHighPriority ? '🔴' : '🚨';
    const prefix = isHighPriority ? 'ALTA PRIORIDAD' : '¡URGENTE!';
    
    return {
      message: `${emoji} ${prefix}: La tarea "${task.title}" vence HOY`,
      alertType: AlertType.URGENT,
      severity: AlertSeverity.HIGH,
    };
  }
}
```

**Características**:
- Crea alertas para tareas que vencen **hoy mismo** (0 días)
- Diferencia entre tareas de alta y baja prioridad
- Usa emojis visuales para mayor claridad (🔴 vs 🚨)
- Siempre retorna severidad HIGH

---

#### **warning-alert.factory.ts**

```typescript
@Injectable()
export class WarningAlertFactory implements IAlertFactory {
  createAlertData(task: Task, daysUntilDue: number): CreateAlertData {
    const isHighPriority = task.priority === TaskPriority.HIGH;
    
    const emoji = isHighPriority ? '🔴' : '⚠️';
    const prefix = isHighPriority ? 'ALTA PRIORIDAD' : 'Advertencia';
    const timeText = daysUntilDue === 1 ? 'MAÑANA' : `en ${daysUntilDue} días`;
    
    return {
      message: `${emoji} ${prefix}: La tarea "${task.title}" vence ${timeText}`,
      alertType: AlertType.WARNING,
      severity: isHighPriority ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
    };
  }
}
```

**Características**:
- Crea alertas para tareas que vencen en **1-2 días**
- Ajusta el lenguaje ("MAÑANA" vs "en X días")
- Prioridad adaptativa (HIGH o MEDIUM según tarea)
- Emojis contextuales (🔴 para alta prioridad, ⚠️ para normal)

---

#### **reminder-alert.factory.ts**

```typescript
@Injectable()
export class ReminderAlertFactory implements IAlertFactory {
  createAlertData(task: Task, daysUntilDue: number): CreateAlertData {
    const isHighPriority = task.priority === TaskPriority.HIGH;
    
    const emoji = isHighPriority ? '📌' : '📅';
    const prefix = isHighPriority ? 'Recordatorio importante' : 'Recordatorio';
    
    return {
      message: `${emoji} ${prefix}: La tarea "${task.title}" vence en ${daysUntilDue} días`,
      alertType: AlertType.REMINDER,
      severity: isHighPriority ? AlertSeverity.MEDIUM : AlertSeverity.LOW,
    };
  }
}
```

**Características**:
- Crea alertas para tareas que vencen en **3-5 días**
- Tono más suave y amigable (recordatorio vs urgencia)
- Severidad menor (LOW o MEDIUM)
- Emojis amigables (📌 vs 📅)

---

### 4. **alert-types.enum.ts** - Enumeraciones

```typescript
export enum AlertType {
  URGENT = 'urgent',
  WARNING = 'warning',
  REMINDER = 'reminder',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
```

**Responsabilidad**: Define los valores permitidos para tipos y niveles de severidad.

---

### 5. **Integración en alerts.service.ts**

```typescript
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>,

    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,

    private readonly alertFactory: AlertFactory,  // ← Factory inyectada
  ) {}

  async generateAlerts() {
    // ... lógica de búsqueda de tareas ...

    for (const task of tasks) {
      const daysUntilDue = deliveryDate.diff(today, 'day');

      if (daysUntilDue >= 0 && daysUntilDue <= 5) {
        // Usar AlertFactory para generar los datos de la alerta
        const alertData = this.alertFactory.createAlert(task, daysUntilDue);
        
        const newAlert = this.alertsRepository.create({
          task: task,
          alertDate: today.toDate(),
          message: alertData.message,
          alertType: alertData.alertType,
          severity: alertData.severity,
        });
        
        await this.alertsRepository.save(newAlert);
      }
    }
  }
}
```

**Uso**: El servicio delega la creación de datos de alerta al `AlertFactory`, desacoplando la lógica de generación de alertas de la lógica de persistencia.

---

## Flujo de Ejecución

### Diagrama de Secuencia

```
┌─────────────────┐
│  alerts.service │
└────────┬────────┘
         │
         │ 1. generateAlerts()
         ↓
    ┌────────────────────────────────────┐
    │ Para cada tarea a vencer:          │
    │ - Calcular daysUntilDue           │
    │ - Llamar alertFactory.createAlert()│
    └────────┬─────────────────────────┘
             │
             │ 2. createAlert(task, daysUntilDue)
             ↓
    ┌──────────────────────────────┐
    │  AlertFactory (Orquestador)  │
    │  - getFactory(daysUntilDue)  │
    └────────┬─────────────────────┘
             │
             ├─ Decisión según daysUntilDue
             │
      ┌──────┴──────┬──────────┐
      │             │          │
   0 días       1-2 días    3-5 días
      │             │          │
      ↓             ↓          ↓
 ┌─────────┐  ┌─────────┐  ┌─────────┐
 │ Urgent  │  │Warning  │  │Reminder │
 │Factory  │  │Factory  │  │Factory  │
 └────┬────┘  └────┬────┘  └────┬────┘
      │             │            │
      └─────────┬───┴────────────┘
                │
                │ 3. createAlertData() - Retorna CreateAlertData
                ↓
    ┌──────────────────────────────┐
    │    CreateAlertData Object     │
    │  - message: string           │
    │  - alertType: AlertType      │
    │  - severity: AlertSeverity   │
    └────────┬─────────────────────┘
             │
             │ 4. Guardar en BD
             ↓
    ┌──────────────────────────┐
    │  Alert Entity (DB)       │
    │  - Persisted to database │
    └──────────────────────────┘
```

### Pasos Detallados

1. **Invocación**: `AlertsService.generateAlerts()` es llamado por un Cron job diariamente
2. **Iteración**: Se procesan todas las tareas que vencen en los próximos 5 días
3. **Cálculo**: Se calcula `daysUntilDue` para cada tarea
4. **Delegación**: Se llama `alertFactory.createAlert(task, daysUntilDue)`
5. **Selección**: El `AlertFactory` usa `getFactory()` para elegir la factory correcta
6. **Creación**: La factory específica crea el `CreateAlertData` con mensaje y metadatos
7. **Persistencia**: Los datos se guardan en la base de datos como una entidad `Alert`

---

## Razones de la Aplicación

### 1. **Lógica de Creación Compleja**

El contenido y tipo de alerta depende de múltiples factores:
- Días hasta la fecha de vencimiento
- Prioridad de la tarea
- Contexto del usuario

Sin el Factory Pattern, `AlertsService` tendría que contener toda esta lógica con múltiples `if-else`:

```typescript
// ❌ Sin Factory Pattern - Código acoplado
if (daysUntilDue === 0) {
  if (task.priority === HIGH) {
    message = '🔴 ALTA PRIORIDAD: ...';
    severity = HIGH;
  } else {
    message = '🚨 ¡URGENTE!: ...';
    severity = HIGH;
  }
} else if (daysUntilDue <= 2) {
  if (task.priority === HIGH) {
    message = '🔴 ALTA PRIORIDAD: ...';
    severity = HIGH;
  } else {
    message = '⚠️ Advertencia: ...';
    severity = MEDIUM;
  }
}
// ... Y así sucesivamente
```

Con Factory Pattern, el código es limpio y separado:

```typescript
// ✅ Con Factory Pattern - Código limpio
const alertData = this.alertFactory.createAlert(task, daysUntilDue);
```

### 2. **Extensibilidad Futura**

Si necesitas agregar nuevos tipos de alertas (ej: "VeryUrgentAlertFactory"), solo debes:

1. Crear una nueva clase que implemente `IAlertFactory`
2. Registrarla en el módulo
3. Agregar una condición en `AlertFactory.getFactory()`

**Código existente no se ve afectado**.

### 3. **Testabilidad**

Cada factory puede ser testeada independientemente:

```typescript
describe('UrgentAlertFactory', () => {
  it('should create urgent alert for high priority task due today', () => {
    const task = { title: 'Exam', priority: HIGH };
    const alertData = factory.createAlertData(task);
    
    expect(alertData.alertType).toBe(AlertType.URGENT);
    expect(alertData.severity).toBe(AlertSeverity.HIGH);
    expect(alertData.message).toContain('🔴');
  });
});
```

### 4. **Separación de Responsabilidades**

- **AlertsService**: Gestiona la base de datos y orquesta el flujo
- **AlertFactory**: Decide qué tipo de factory usar
- **Factories específicas**: Generan los datos de la alerta

Cada componente tiene una única responsabilidad.

### 5. **Evitar Duplicación**

La lógica para crear diferentes tipos de alertas está centralizada. Si cambias cómo se crea una alerta urgente, solo cambias `UrgentAlertFactory`, no múltiples lugares.

---

## Ventajas y Beneficios

| Ventaja | Descripción |
|---------|-------------|
| **Desacoplamiento** | El servicio no necesita conocer los detalles de cómo se crean las alertas |
| **Mantenibilidad** | Cada tipo de alerta está en su propio archivo con lógica clara |
| **Escalabilidad** | Agregar nuevos tipos de alertas es simple y no afecta código existente |
| **Reutilización** | Las factories pueden reutilizarse en otros servicios si es necesario |
| **Testabilidad** | Cada factory puede ser testeada de forma aislada |
| **Claridad** | El código es más legible y fácil de entender |
| **Single Responsibility** | Cada clase tiene una única razón para cambiar |
| **Flexibilidad** | La selección de factory puede cambiar sin afectar el resto del código |

---

## Comparación: Con y Sin Factory Pattern

### ❌ Sin Factory Pattern

```typescript
// alertsService.ts - 200+ líneas con lógica mezclada
async generateAlerts() {
  for (const task of tasks) {
    const daysUntilDue = deliveryDate.diff(today, 'day');
    let message = '';
    let alertType = '';
    let severity = '';

    // Lógica urgente
    if (daysUntilDue === 0) {
      const emoji = task.priority === HIGH ? '🔴' : '🚨';
      const prefix = task.priority === HIGH ? 'ALTA PRIORIDAD' : '¡URGENTE!';
      message = `${emoji} ${prefix}: La tarea "${task.title}" vence HOY`;
      alertType = AlertType.URGENT;
      severity = AlertSeverity.HIGH;
    }
    // Lógica warning
    else if (daysUntilDue <= 2) {
      const emoji = task.priority === HIGH ? '🔴' : '⚠️';
      const prefix = task.priority === HIGH ? 'ALTA PRIORIDAD' : 'Advertencia';
      const timeText = daysUntilDue === 1 ? 'MAÑANA' : `en ${daysUntilDue} días`;
      message = `${emoji} ${prefix}: La tarea "${task.title}" vence ${timeText}`;
      alertType = AlertType.WARNING;
      severity = task.priority === HIGH ? AlertSeverity.HIGH : AlertSeverity.MEDIUM;
    }
    // Lógica reminder
    else if (daysUntilDue <= 5) {
      const emoji = task.priority === HIGH ? '📌' : '📅';
      const prefix = task.priority === HIGH ? 'Recordatorio importante' : 'Recordatorio';
      message = `${emoji} ${prefix}: La tarea "${task.title}" vence en ${daysUntilDue} días`;
      alertType = AlertType.REMINDER;
      severity = task.priority === HIGH ? AlertSeverity.MEDIUM : AlertSeverity.LOW;
    }

    const newAlert = this.alertsRepository.create({
      task,
      alertDate: today.toDate(),
      message,
      alertType,
      severity,
    });

    await this.alertsRepository.save(newAlert);
  }
}
```

### ✅ Con Factory Pattern

```typescript
// alertsService.ts - Limpio y enfocado
async generateAlerts() {
  for (const task of tasks) {
    const daysUntilDue = deliveryDate.diff(today, 'day');
    
    const alertData = this.alertFactory.createAlert(task, daysUntilDue);
    
    const newAlert = this.alertsRepository.create({
      task,
      alertDate: today.toDate(),
      ...alertData,
    });

    await this.alertsRepository.save(newAlert);
  }
}
```

**Diferencia**: 
- Sin Factory: Servicio tiene responsabilidades múltiples
- Con Factory: Servicio solo orquesta, lógica delegada

---

## Conclusión

El **Factory Pattern** en el módulo de alertas es una decisión arquitectónica excelente porque:

1. ✅ **Encapsula** la lógica compleja de creación de alertas
2. ✅ **Facilita** la extensión con nuevos tipos de alertas
3. ✅ **Mejora** la legibilidad y mantenibilidad del código
4. ✅ **Promueve** la reutilización y testabilidad
5. ✅ **Sigue** principios SOLID (especialmente SRP y OCP)

Esta implementación es un ejemplo de cómo aplicar patrones de diseño de forma pragmática para resolver problemas reales en una aplicación NestJS.

---

## Referencias

- [Refactoring Guru - Factory Pattern](https://refactoring.guru/design-patterns/factory-method)
- [TypeScript Design Patterns](https://www.typescriptlang.org/docs/)
- [NestJS Dependency Injection](https://docs.nestjs.com/providers)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

