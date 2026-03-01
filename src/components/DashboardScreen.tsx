import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Flame, Quote } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const DashboardScreen = () => {
  const { tasks, routines, quote } = useAppStore();

  const todayTasks = tasks;
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const totalEstimated = todayTasks.reduce((a, t) => a + t.duration, 0);
  const totalReal = todayTasks.reduce((a, t) => a + t.realDuration, 0);
  const completedRoutines = routines.filter(r => r.completed).length;
  const isHonorable = completedTasks >= todayTasks.length * 0.7 && completedRoutines >= routines.length * 0.6;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">1 Mars 2026</p>
          <h1 className="text-2xl font-bold tracking-tight">Bonjour.</h1>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isHonorable ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
          {isHonorable ? 'Journée honorable' : 'En cours…'}
        </div>
      </motion.div>

      {/* Quote */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex gap-3 items-start">
          <Quote size={16} className="text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-sand italic leading-relaxed">{quote}</p>
        </div>
      </motion.div>

      {/* Time Overview */}
      <motion.div variants={item} className="glass-card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground/80">Temps — Aujourd'hui</h2>
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <p className="text-3xl font-bold font-mono text-foreground">{Math.floor(totalReal / 60)}h{(totalReal % 60).toString().padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground mt-1">Réel</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-3xl font-bold font-mono text-muted-foreground">{Math.floor(totalEstimated / 60)}h{(totalEstimated % 60).toString().padStart(2, '0')}</p>
            <p className="text-xs text-muted-foreground mt-1">Prévu</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalReal / totalEstimated) * 100, 100)}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Tasks */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground/80">Tâches du jour</h2>
          <span className="text-xs text-muted-foreground font-mono">{completedTasks}/{todayTasks.length}</span>
        </div>
        <div className="space-y-2">
          {todayTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </motion.div>

      {/* Routines */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground/80">Routines</h2>
          <span className="text-xs text-muted-foreground font-mono">{completedRoutines}/{routines.length}</span>
        </div>
        <div className="space-y-2">
          {routines.map((routine) => (
            <RoutineRow key={routine.id} routine={routine} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const TaskRow = ({ task }: { task: any }) => {
  const { toggleTask } = useAppStore();
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => toggleTask(task.id)}
      className="glass-card p-3.5 w-full flex items-center gap-3 text-left"
    >
      {task.completed ? (
        <CheckCircle2 size={18} className="text-success shrink-0" />
      ) : (
        <Circle size={18} className="text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{task.category}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-mono text-muted-foreground">{task.duration} min</p>
        {task.strict && <span className="text-[9px] text-warning font-semibold">STRICT</span>}
      </div>
    </motion.button>
  );
};

const RoutineRow = ({ routine }: { routine: any }) => {
  const { toggleRoutine } = useAppStore();
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => toggleRoutine(routine.id)}
      className="glass-card p-3.5 w-full flex items-center gap-3 text-left"
    >
      {routine.completed ? (
        <CheckCircle2 size={18} className="text-success shrink-0" />
      ) : (
        <Circle size={18} className="text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${routine.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {routine.name}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-accent">
        <Flame size={12} />
        <span className="font-mono">{routine.streak}j</span>
      </div>
    </motion.button>
  );
};
