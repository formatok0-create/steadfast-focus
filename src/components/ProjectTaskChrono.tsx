import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Task } from '@/types/app';

interface Props {
  task: Task;
  projectId: string;
}

export const ProjectTaskChrono = ({ task, projectId }: Props) => {
  const { addTimerSession, updateProjectTaskRealDuration } = useAppStore();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds for current session
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = () => {
    setRunning(true);
    setSessionStart(Date.now());
  };

  const handlePause = () => {
    setRunning(false);
  };

  const handleStop = () => {
    if (elapsed > 0 && sessionStart) {
      const sessionDurationMin = Math.round(elapsed / 60);
      if (sessionDurationMin > 0) {
        addTimerSession(projectId, task.id, {
          id: Math.random().toString(36).slice(2, 10),
          startTime: sessionStart,
          endTime: Date.now(),
          duration: sessionDurationMin,
        });
      }
    }
    setRunning(false);
    setElapsed(0);
    setSessionStart(null);
  };

  const totalReal = task.realDuration + Math.round(elapsed / 60);
  const overTime = totalReal > task.duration;

  return (
    <div className="pt-2 border-t border-border/50 space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className={`text-2xl font-mono font-bold ${overTime ? 'text-destructive' : 'text-foreground'}`}>
            {formatTime(elapsed)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Total : {totalReal} / {task.duration} min
          </p>
        </div>
        <div className="flex gap-2">
          {!running ? (
            <button
              onClick={handleStart}
              className="p-3 rounded-xl bg-primary/15 text-primary transition-colors"
            >
              <Play size={18} />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-3 rounded-xl bg-warning/15 text-warning transition-colors"
            >
              <Pause size={18} />
            </button>
          )}
          {(elapsed > 0 || running) && (
            <button
              onClick={handleStop}
              className="p-3 rounded-xl bg-destructive/10 text-destructive transition-colors"
            >
              <Square size={18} />
            </button>
          )}
        </div>
      </div>
      {overTime && (
        <p className="text-[10px] text-destructive font-semibold">⚠ Dépassement du temps estimé</p>
      )}
    </div>
  );
};
