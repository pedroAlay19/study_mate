import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, RotateCcw, Coffee, BookOpen, CheckCircle2, Settings } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { usePomodoroSessions } from "@/hooks/usePomodoro";
import { usePomodoro } from "@/contexts/PomodoroContext";
import { PomodoroSettings } from "@/components/PomodoroSettings";
import { useState } from "react";

export default function Pomodoro() {
  const { data: tasks = [] } = useTasks();
  const { data: sessions = [] } = usePomodoroSessions();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const {
    minutes,
    seconds,
    isActive,
    isBreak,
    completedPomodoros,
    selectedTaskId,
    workTime,
    breakTime,
    setSelectedTaskId,
    toggleTimer,
    resetTimer,
    formatTime,
    progress,
    updateSettings,
  } = usePomodoro();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-foreground">Técnica Pomodoro</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            title="Configurar tiempos"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">
          Aumenta tu concentración con intervalos de trabajo enfocado
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Configuración actual: {workTime} min trabajo • {breakTime} min descanso
        </p>
      </div>

      {/* Selector de Tarea */}
      {!isBreak && !isActive && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Selecciona una tarea</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTaskId} onValueChange={(value: string) => setSelectedTaskId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Elige la tarea en la que trabajarás" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.task_id} value={task.task_id}>
                    <div className="flex items-center gap-2">
                      {task.subject && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.subject.color }}
                        />
                      )}
                      {task.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-xl bg-gradient-card">
        <CardContent className="p-8">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`p-4 rounded-full ${isBreak ? "bg-success/10" : "bg-primary/10"}`}>
                {isBreak ? (
                  <Coffee className={`w-8 h-8 ${isBreak ? "text-success" : "text-primary"}`} />
                ) : (
                  <BookOpen className={`w-8 h-8 ${isBreak ? "text-success" : "text-primary"}`} />
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {isBreak ? "Tiempo de Descanso" : "Sesión de Estudio"}
              </h2>
            </div>

            <div className="relative">
              <div className="text-8xl font-bold text-foreground mb-6">
                {formatTime(minutes, seconds)}
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={toggleTimer} className="w-32 shadow-lg">
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer} className="w-32">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Pomodoros Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{completedPomodoros}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Total Sesiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary">
              {sessions.filter((s) => s.completed).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Tiempo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">
              {sessions.filter((s) => s.completed).reduce((acc, s) => acc + s.duration_min, 0)} min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial reciente */}
      {sessions.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Sesiones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.session_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {session.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Coffee className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{session.task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.start_session).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{session.duration_min} min</p>
                    <p className="text-sm text-muted-foreground">
                      {session.completed ? "Completado" : "En progreso"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md bg-muted/50">
        <CardHeader>
          <CardTitle>¿Qué es la Técnica Pomodoro?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>La técnica Pomodoro es un método de gestión del tiempo que consiste en:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{workTime} minutos de trabajo concentrado</li>
            <li>{breakTime} minutos de descanso</li>
            <li>Después de 4 pomodoros, toma un descanso más largo (15-30 minutos)</li>
          </ul>
          <p className="text-sm mt-3">
            💡 Puedes personalizar los tiempos haciendo clic en el botón de configuración ⚙️
          </p>
        </CardContent>
      </Card>

      {/* Dialog de configuración */}
      <PomodoroSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={updateSettings}
        currentWorkTime={workTime}
        currentBreakTime={breakTime}
      />
    </div>
  );
}
