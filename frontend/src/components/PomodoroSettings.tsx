import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PomodoroSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workTime: number, breakTime: number) => void;
  currentWorkTime: number;
  currentBreakTime: number;
}

export function PomodoroSettings({
  open,
  onOpenChange,
  onSave,
  currentWorkTime,
  currentBreakTime,
}: PomodoroSettingsProps) {
  const [workMinutes, setWorkMinutes] = useState(currentWorkTime);
  const [breakMinutes, setBreakMinutes] = useState(currentBreakTime);

  useEffect(() => {
    if (open) {
      setWorkMinutes(currentWorkTime);
      setBreakMinutes(currentBreakTime);
    }
  }, [open, currentWorkTime, currentBreakTime]);

  const handleSave = () => {
    // Validaciones
    if (workMinutes < 1 || workMinutes > 60) {
      toast.error("El tiempo de estudio debe estar entre 1 y 60 minutos");
      return;
    }

    if (breakMinutes < 1 || breakMinutes > 30) {
      toast.error("El tiempo de descanso debe estar entre 1 y 30 minutos");
      return;
    }

    onSave(workMinutes, breakMinutes);
    toast.success("Configuración guardada correctamente");
    onOpenChange(false);
  };

  const handleReset = () => {
    setWorkMinutes(25);
    setBreakMinutes(5);
    onSave(25, 5);
    toast.success("Configuración restaurada a valores predeterminados");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración del Temporizador</DialogTitle>
          <DialogDescription>
            Personaliza los tiempos de estudio y descanso según tus necesidades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tiempo de Estudio */}
          <div className="space-y-2">
            <Label htmlFor="workTime" className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              Tiempo de Estudio (minutos)
            </Label>
            <Input
              id="workTime"
              type="number"
              min="1"
              max="60"
              value={workMinutes}
              onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 1)}
              placeholder="25"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 25 minutos (técnica Pomodoro tradicional)
            </p>
          </div>

          {/* Tiempo de Descanso */}
          <div className="space-y-2">
            <Label htmlFor="breakTime" className="flex items-center gap-2">
              <span className="text-lg">☕</span>
              Tiempo de Descanso (minutos)
            </Label>
            <Input
              id="breakTime"
              type="number"
              min="1"
              max="30"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 1)}
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 5 minutos (descanso corto entre sesiones)
            </p>
          </div>

          {/* Vista previa */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium mb-2">Vista previa:</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{workMinutes} min</span>
              <span>de estudio</span>
              <span>→</span>
              <span className="font-semibold text-success">{breakMinutes} min</span>
              <span>de descanso</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Restaurar Predeterminados
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">
              Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
