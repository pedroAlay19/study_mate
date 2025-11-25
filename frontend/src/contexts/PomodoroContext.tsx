import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useCreatePomodoroSession, useUpdatePomodoroSession } from '@/hooks/usePomodoro';
import { toast } from 'sonner';

interface PomodoroState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
  completedPomodoros: number;
  selectedTaskId: string;
  currentSessionId: string | null;
  workTime: number; // en minutos
  breakTime: number; // en minutos
}

interface PomodoroContextType extends PomodoroState {
  setSelectedTaskId: (id: string) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTime: (mins: number, secs: number) => string;
  progress: number;
  updateSettings: (workTime: number, breakTime: number) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const STORAGE_KEY = 'pomodoro_state';
const SETTINGS_KEY = 'pomodoro_settings';

// Valores por defecto
const DEFAULT_WORK_TIME = 25;
const DEFAULT_BREAK_TIME = 5;

export function PomodoroProvider({ children }: { children: ReactNode }) {
  // Cargar configuración de tiempos desde localStorage
  const getSettings = () => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { workTime: DEFAULT_WORK_TIME, breakTime: DEFAULT_BREAK_TIME };
      }
    }
    return { workTime: DEFAULT_WORK_TIME, breakTime: DEFAULT_BREAK_TIME };
  };

  const [state, setState] = useState<PomodoroState>(() => {
    const settings = getSettings();
    // Intentar recuperar el estado del localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          workTime: settings.workTime,
          breakTime: settings.breakTime,
        };
      } catch {
        return {
          minutes: settings.workTime,
          seconds: 0,
          isActive: false,
          isBreak: false,
          completedPomodoros: 0,
          selectedTaskId: '',
          currentSessionId: null,
          workTime: settings.workTime,
          breakTime: settings.breakTime,
        };
      }
    }
    return {
      minutes: settings.workTime,
      seconds: 0,
      isActive: false,
      isBreak: false,
      completedPomodoros: 0,
      selectedTaskId: '',
      currentSessionId: null,
      workTime: settings.workTime,
      breakTime: settings.breakTime,
    };
  });

  const createSession = useCreatePomodoroSession();
  const updateSession = useUpdatePomodoroSession();

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Temporizador
  useEffect(() => {
    let interval: number | null = null;

    if (state.isActive) {
      interval = setInterval(() => {
        setState((prev) => {
          if (prev.seconds === 0) {
            if (prev.minutes === 0) {
              // Timer finished
              if (!prev.isBreak) {
                // Completar sesión de trabajo
                if (prev.currentSessionId) {
                  updateSession.mutate({
                    id: prev.currentSessionId,
                    data: {
                      end_session: new Date().toISOString(),
                      completed: true,
                    },
                  });
                }
                toast.success('¡Pomodoro completado! Toma un descanso');
                return {
                  ...prev,
                  isActive: false,
                  isBreak: true,
                  minutes: prev.breakTime,
                  seconds: 0,
                  completedPomodoros: prev.completedPomodoros + 1,
                  currentSessionId: null,
                };
              } else {
                // Terminar descanso
                toast.info('¡Descanso terminado! Listo para otro Pomodoro');
                return {
                  ...prev,
                  isActive: false,
                  isBreak: false,
                  minutes: prev.workTime,
                  seconds: 0,
                };
              }
            } else {
              return {
                ...prev,
                minutes: prev.minutes - 1,
                seconds: 59,
              };
            }
          } else {
            return {
              ...prev,
              seconds: prev.seconds - 1,
            };
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isActive, updateSession]);

  const toggleTimer = () => {
    if (!state.isActive && !state.isBreak && state.selectedTaskId && !state.currentSessionId) {
      // Iniciar nueva sesión de trabajo
      createSession.mutate(
        {
          taskId: state.selectedTaskId,
          duration_min: state.workTime,
          breaks_taken: 0,
          completed: false,
        },
        {
          onSuccess: (session) => {
            setState((prev) => ({
              ...prev,
              currentSessionId: session.session_id,
              isActive: true,
            }));
          },
        }
      );
    } else if (!state.isActive && !state.isBreak && !state.selectedTaskId) {
      toast.error('Selecciona una tarea antes de iniciar');
    } else {
      setState((prev) => ({ ...prev, isActive: !prev.isActive }));
    }
  };

  const resetTimer = () => {
    if (state.currentSessionId && !state.isBreak) {
      // Cancelar sesión actual
      updateSession.mutate({
        id: state.currentSessionId,
        data: {
          end_session: new Date().toISOString(),
          completed: false,
        },
      });
    }
    setState((prev) => ({
      minutes: prev.workTime,
      seconds: 0,
      isActive: false,
      isBreak: false,
      completedPomodoros: prev.completedPomodoros,
      selectedTaskId: '',
      currentSessionId: null,
      workTime: prev.workTime,
      breakTime: prev.breakTime,
    }));
  };

  const setSelectedTaskId = (id: string) => {
    setState((prev) => ({ ...prev, selectedTaskId: id }));
  };

  const updateSettings = (workTime: number, breakTime: number) => {
    // Guardar en localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ workTime, breakTime }));
    
    // Actualizar estado
    setState((prev) => ({
      ...prev,
      workTime,
      breakTime,
      minutes: prev.isBreak ? breakTime : workTime,
      seconds: 0,
    }));
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = state.isBreak ? state.breakTime * 60 : state.workTime * 60;
  const currentSeconds = state.minutes * 60 + state.seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <PomodoroContext.Provider
      value={{
        ...state,
        setSelectedTaskId,
        toggleTimer,
        resetTimer,
        formatTime,
        progress,
        updateSettings,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within PomodoroProvider');
  }
  return context;
}
