import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, AlertCircle, FileText } from "lucide-react";
import type { Task, TaskState, TaskPriority } from "@/services/tasks.service";
import { TaskState as TaskStateEnum, TaskPriority as TaskPriorityEnum } from "@/services/tasks.service";
import { AttachmentsManager } from "./AttachmentsManager";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function TaskDetailDialog({ open, onOpenChange, task }: TaskDetailDialogProps) {
  if (!task) return null;

  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriorityEnum.LOW]: "#10b981",
    [TaskPriorityEnum.MEDIUM]: "#f59e0b",
    [TaskPriorityEnum.HIGH]: "#ef4444",
  };

  const priorityLabels: Record<TaskPriority, string> = {
    [TaskPriorityEnum.LOW]: "Baja",
    [TaskPriorityEnum.MEDIUM]: "Media",
    [TaskPriorityEnum.HIGH]: "Alta",
  };

  const stateLabels: Record<TaskState, string> = {
    [TaskStateEnum.PENDING]: "Pendiente",
    [TaskStateEnum.IN_PROGRESS]: "En Progreso",
    [TaskStateEnum.COMPLETED]: "Completada",
    [TaskStateEnum.CANCELLED]: "Cancelada",
  };

  const stateColors: Record<TaskState, string> = {
    [TaskStateEnum.PENDING]: "#6b7280",
    [TaskStateEnum.IN_PROGRESS]: "#3b82f6",
    [TaskStateEnum.COMPLETED]: "#10b981",
    [TaskStateEnum.CANCELLED]: "#ef4444",
  };

  const daysUntil = Math.ceil(
    (new Date(task.delivery_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntil < 0;
  const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <DialogDescription>Detalles y recursos de la tarea</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges de estado y prioridad */}
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${stateColors[task.state]}15`,
                borderColor: stateColors[task.state],
                color: stateColors[task.state],
              }}
            >
              <Clock className="w-3 h-3 mr-1" />
              {stateLabels[task.state]}
            </Badge>
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${priorityColors[task.priority]}15`,
                borderColor: priorityColors[task.priority],
                color: priorityColors[task.priority],
              }}
            >
              {priorityLabels[task.priority]}
            </Badge>
            {task.subject && (
              <Badge variant="outline" className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.subject.color }}
                />
                {task.subject.name}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Descripción */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Descripción
            </h3>
            <p className="text-foreground">{task.description}</p>
          </div>

          {/* Notas/Comentarios */}
          {task.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas / Comentarios
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-foreground whitespace-pre-wrap">{task.notes}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Fecha de Inicio
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {new Date(task.start_date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Fecha de Entrega
              </h3>
              <div
                className={`flex items-center gap-2 ${
                  isOverdue
                    ? "text-destructive"
                    : isDueSoon
                    ? "text-orange-600"
                    : ""
                }`}
              >
                {(isOverdue || isDueSoon) && <AlertCircle className="w-4 h-4" />}
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(task.delivery_date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {isOverdue && (
                <p className="text-xs text-destructive">
                  Vencida hace {Math.abs(daysUntil)} días
                </p>
              )}
              {isDueSoon && (
                <p className="text-xs text-orange-600">
                  Vence en {daysUntil} {daysUntil === 1 ? "día" : "días"}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Attachments Manager */}
          <AttachmentsManager taskId={task.task_id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
