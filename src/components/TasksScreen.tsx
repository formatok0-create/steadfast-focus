import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const TasksScreen = () => {
  const { tasks, toggleTask } = useAppStore();
  const totalPlanned = tasks.reduce((a, t) => a + t.duration, 0);
  const completed = tasks.filter(t => t.completed).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Tâches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {completed}/{tasks.length} terminées · {totalPlanned} min prévues
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-primary" />
          <span className="text-xs font-semibold text-foreground/80">Timeline du jour</span>
        </div>
        <div className="flex gap-1 h-8">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              className={`rounded-md flex items-center justify-center text-[9px] font-mono ${
                task.completed ? 'bg-success/20 text-success' : 'bg-primary/15 text-primary'
              }`}
              style={{ flex: task.duration }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {task.duration}m
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Task list with chrono */}
      {tasks.map((task) => (
        <motion.div key={task.id} variants={item}>
          <TaskCardWithChrono task={task} onToggle={() => toggleTask(task.id)} />
        </motion.div>
      ))}
    </motion.div>
  );
};

const TaskCardWithChrono = ({ task, onToggle }: { task: any; onToggle: () => void }) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(task.realDuration * 60); // seconds

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

  return (
    <div className="glass-card-elevated p-4 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={onToggle}>
          {task.completed ? (
            <CheckCircle2 size={20} className="text-success" />
          ) : (
            <Circle size={20} className="text-muted-foreground" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.name}
          </p>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{task.category}</span>
            {task.strict && <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-semibold">STRICT</span>}
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{task.duration}m</span>
      </div>

      {/* Chrono */}
      {!task.completed && (
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <p className="text-xl font-mono font-bold text-foreground flex-1">{formatTime(elapsed)}</p>
          <button
            onClick={() => setRunning(!running)}
            className={`p-2.5 rounded-xl transition-colors duration-300 ${running ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'}`}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {elapsed > 0 && (
            <button
              onClick={() => { setRunning(false); setElapsed(0); }}
              className="p-2.5 rounded-xl bg-destructive/10 text-destructive"
            >
              <Square size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
