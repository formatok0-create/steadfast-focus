import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Flame, Quote, Target, BookOpen, Zap, AlertTriangle, Trophy } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export const DashboardScreen = () => {
  const { tasks, routines, projects, formations, skills, quote, setTaskStatus, toggleRoutine } = useAppStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "d MMMM yyyy", { locale: fr });

  // Today's tasks (daily + project tasks for today)
  const todayTasks = tasks.filter(t => t.day === today);
  const todayProjectTasks = projects.flatMap(p => p.tasks.filter(t => t.day === today));
  const allTodayTasks = [...todayTasks, ...todayProjectTasks];

  const completedTasks = allTodayTasks.filter(t => t.completed).length;
  const totalEstimated = allTodayTasks.reduce((a, t) => a + t.duration, 0);
  const totalReal = allTodayTasks.reduce((a, t) => a + t.realDuration, 0);

  // Active routines only
  const activeRoutines = routines.filter(r => r.active);
  const completedRoutines = activeRoutines.filter(r => r.completed).length;

  // Honorable day logic
  const taskRate = allTodayTasks.length > 0 ? completedTasks / allTodayTasks.length : 0;
  const routineRate = activeRoutines.length > 0 ? completedRoutines / activeRoutines.length : 0;
  const isHonorable = taskRate >= 0.7 && routineRate >= 0.6;
  const isIncomplete = !isHonorable && (completedTasks > 0 || completedRoutines > 0);

  // Quick stats
  const activeProjects = projects.filter(p => p.status === 'en_cours').length;
  const activeFormations = formations.filter(f => f.status === 'en_cours').length;
  const activeSkills = skills.filter(s => s.active).length;

  // Time diff
  const timeDiff = totalReal - totalEstimated;
  const timeDiffLabel = timeDiff > 0 ? `+${timeDiff}m` : timeDiff < 0 ? `${timeDiff}m` : '0m';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm capitalize">{todayLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">Bonjour.</h1>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            isHonorable
              ? 'bg-success/15 text-success'
              : isIncomplete
                ? 'bg-warning/15 text-warning'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {isHonorable ? (
            <><Trophy size={12} /> Journée honorable</>
          ) : isIncomplete ? (
            <><AlertTriangle size={12} /> Incomplète</>
          ) : (
            <>⏳ En attente</>
          )}
        </motion.div>
      </motion.div>

      {/* Quote */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex gap-3 items-start">
          <Quote size={16} className="text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-sand italic leading-relaxed">{quote}</p>
        </div>
      </motion.div>

      {/* Quick Overview Cards */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <Target size={14} className="mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-foreground">{activeProjects}</p>
          <p className="text-[10px] text-muted-foreground">Projets actifs</p>
        </div>
        <div className="glass-card p-3 text-center">
          <BookOpen size={14} className="mx-auto mb-1 text-accent" />
          <p className="text-lg font-bold text-foreground">{activeFormations}</p>
          <p className="text-[10px] text-muted-foreground">Formations</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Zap size={14} className="mx-auto mb-1 text-warning" />
          <p className="text-lg font-bold text-foreground">{activeSkills}</p>
          <p className="text-[10px] text-muted-foreground">Compétences</p>
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
            <p className="text-3xl font-bold font-mono text-foreground">
              {Math.floor(totalReal / 60)}h{(totalReal % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Réel</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-3xl font-bold font-mono text-muted-foreground">
              {Math.floor(totalEstimated / 60)}h{(totalEstimated % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Prévu</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className={`text-3xl font-bold font-mono ${timeDiff > 0 ? 'text-destructive' : timeDiff < 0 ? 'text-success' : 'text-muted-foreground'}`}>
              {timeDiffLabel}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Écart</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalEstimated > 0 ? Math.min((totalReal / totalEstimated) * 100, 100) : 0}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Tasks */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground/80">Tâches du jour</h2>
          <span className="text-xs text-muted-foreground font-mono">{completedTasks}/{allTodayTasks.length}</span>
        </div>
        {allTodayTasks.length === 0 ? (
          <div className="glass-card p-4 text-center text-sm text-muted-foreground">
            Aucune tâche prévue aujourd'hui
          </div>
        ) : (
          <div className="space-y-2">
            {allTodayTasks.map((task) => (
              <motion.button
                key={task.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!task.projectId) {
                    setTaskStatus(task.id, task.completed ? undefined as any : 'terminée');
                  }
                }}
                className="glass-card p-3.5 w-full flex items-center gap-3 text-left"
              >
                {task.completed ? (
                  <CheckCircle2 size={18} className="text-success shrink-0" />
                ) : task.status === 'évitée' ? (
                  <Circle size={18} className="text-destructive shrink-0" />
                ) : (
                  <Circle size={18} className="text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">{task.category}</p>
                    {task.projectId && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Projet</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-muted-foreground">{task.duration}m</p>
                  {task.realDuration > 0 && (
                    <p className="text-[10px] font-mono text-primary">{task.realDuration}m réel</p>
                  )}
                  {task.strict && <span className="text-[9px] text-warning font-semibold">STRICT</span>}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Routines */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground/80">Routines</h2>
          <span className="text-xs text-muted-foreground font-mono">{completedRoutines}/{activeRoutines.length}</span>
        </div>
        {/* Progress ring for routines */}
        <div className="mb-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-success rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${activeRoutines.length > 0 ? (completedRoutines / activeRoutines.length) * 100 : 0}%` }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </div>
        <div className="space-y-2">
          {activeRoutines.map((routine) => (
            <motion.button
              key={routine.id}
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
                <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{routine.category}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-accent">
                <Flame size={12} />
                <span className="font-mono">{routine.streak}j</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Day summary footer */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tâches: {Math.round(taskRate * 100)}%</span>
          <span>Routines: {Math.round(routineRate * 100)}%</span>
          <span className={isHonorable ? 'text-success font-semibold' : 'text-warning font-semibold'}>
            {isHonorable ? '✅ Honorable' : '⚠️ Incomplète'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
