import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Flame, Quote, Target, BookOpen, Zap, AlertTriangle, Trophy, TrendingUp, ArrowRight, Plus, Play, Timer } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export const DashboardScreen = () => {
  const { tasks, routines, projects, formations, skills, quote, setTaskStatus, toggleRoutine, setActiveTab } = useAppStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "EEEE d MMMM", { locale: fr });

  const todayTasks = tasks.filter(t => t.day === today);
  const todayProjectTasks = projects.flatMap(p => p.tasks.filter(t => t.day === today));
  const allTodayTasks = [...todayTasks, ...todayProjectTasks];

  const completedTasks = allTodayTasks.filter(t => t.completed).length;
  const totalEstimated = allTodayTasks.reduce((a, t) => a + t.duration, 0);
  const totalReal = allTodayTasks.reduce((a, t) => a + t.realDuration, 0);

  const activeRoutines = routines.filter(r => r.active);
  const completedRoutines = activeRoutines.filter(r => r.completed).length;

  const taskRate = allTodayTasks.length > 0 ? completedTasks / allTodayTasks.length : 0;
  const routineRate = activeRoutines.length > 0 ? completedRoutines / activeRoutines.length : 0;
  const isHonorable = taskRate >= 0.7 && routineRate >= 0.6;

  const activeProjects = projects.filter(p => p.status === 'en_cours').length;
  const activeFormations = formations.filter(f => f.status === 'en_cours').length;
  const activeSkills = skills.filter(s => s.active).length;

  const timeProgress = totalEstimated > 0 ? Math.min((totalReal / totalEstimated) * 100, 100) : 0;
  const productivityScore = Math.round((taskRate * 60 + routineRate * 40));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-4">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium capitalize">{todayLabel}</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">
            Bonjour<span className="text-gradient">.</span>
          </h1>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            isHonorable
              ? 'gradient-fresh text-white glow-success'
              : 'glass-card-bright text-warning'
          }`}
        >
          {isHonorable ? (
            <><Trophy size={14} /> Honorable</>
          ) : (
            <><AlertTriangle size={14} /> Incomplète</>
          )}
        </motion.div>
      </motion.div>

      {/* Quote Widget */}
      <motion.div variants={item} className="widget-card relative">
        <div className="absolute top-0 left-0 w-1 h-full gradient-primary rounded-full" />
        <div className="flex gap-3 items-start pl-3">
          <Quote size={14} className="text-accent mt-0.5 shrink-0 opacity-60" />
          <p className="text-sm text-foreground/70 italic leading-relaxed font-light">{quote}</p>
        </div>
      </motion.div>

      {/* Daily Progress Widget — Hero */}
      <motion.div variants={item} className="widget-card-glow relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-10 gradient-primary blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-8 gradient-warm blur-3xl" />

        <div className="flex items-center gap-2 mb-5 relative z-10">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Progression du jour</h2>
            <p className="text-[10px] text-muted-foreground">Score de productivité</p>
          </div>
        </div>

        {/* Score + Stats */}
        <div className="flex items-center gap-6 relative z-10">
          {/* Big score ring */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - productivityScore / 100) }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono text-foreground">{productivityScore}</span>
              <span className="text-[9px] text-muted-foreground font-medium">score</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Tâches</span>
                <span className="font-mono font-bold text-primary">{completedTasks}/{allTodayTasks.length}</span>
              </div>
              <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${taskRate * 100}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Routines</span>
                <span className="font-mono font-bold text-accent">{completedRoutines}/{activeRoutines.length}</span>
              </div>
              <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                <motion.div className="h-full gradient-warm rounded-full" initial={{ width: 0 }} animate={{ width: `${routineRate * 100}%` }} transition={{ duration: 1, delay: 0.6 }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Time Widget */}
      <motion.div variants={item} className="widget-card relative">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-8 gradient-cool blur-3xl" />
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="w-8 h-8 rounded-xl gradient-cool flex items-center justify-center">
            <Clock size={16} className="text-white" />
          </div>
          <h2 className="text-sm font-bold text-foreground/80">Temps travaillé</h2>
        </div>
        <div className="flex gap-4 items-end relative z-10">
          <div className="flex-1">
            <p className="text-4xl font-black font-mono text-foreground tracking-tight">
              {Math.floor(totalReal / 60)}<span className="text-primary">h</span>{(totalReal % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Temps réel</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold font-mono text-muted-foreground">
              {Math.floor(totalEstimated / 60)}h{(totalEstimated % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Prévu</p>
          </div>
        </div>
        <div className="mt-4 h-2.5 bg-muted/60 rounded-full overflow-hidden relative z-10">
          <motion.div
            className="h-full rounded-full gradient-cool"
            initial={{ width: 0 }}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 font-mono text-right relative z-10">{Math.round(timeProgress)}% consommé</p>
      </motion.div>

      {/* Quick Stats Widgets */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('projects')}
          className="stat-card stat-card-blue text-center"
        >
          <Target size={18} className="mx-auto mb-2 text-primary" />
          <p className="text-2xl font-black text-foreground">{activeProjects}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Projets</p>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('formations')}
          className="stat-card stat-card-violet text-center"
        >
          <BookOpen size={18} className="mx-auto mb-2 text-accent" />
          <p className="text-2xl font-black text-foreground">{activeFormations}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Formations</p>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('skills')}
          className="stat-card stat-card-amber text-center"
        >
          <Zap size={18} className="mx-auto mb-2 text-warning" />
          <p className="text-2xl font-black text-foreground">{activeSkills}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Compétences</p>
        </motion.button>
      </motion.div>

      {/* Quick Actions Widget */}
      <motion.div variants={item} className="widget-card space-y-3">
        <h2 className="text-sm font-bold text-foreground/80">Actions rapides</h2>
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('tasks')}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Plus size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-primary">Tâche</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('routines')}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-accent/10 hover:bg-accent/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl gradient-cool flex items-center justify-center shadow-lg">
              <Flame size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-accent">Routines</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('planning')}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-emerald/10 hover:bg-emerald/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center shadow-lg">
              <Timer size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-emerald">Planning</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Tasks Widget */}
      <motion.div variants={item} className="widget-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-foreground/80">Tâches du jour</h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab('tasks')}
            className="flex items-center gap-1 text-xs text-primary font-semibold"
          >
            Voir tout <ArrowRight size={12} />
          </motion.button>
        </div>
        {allTodayTasks.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Aucune tâche prévue</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allTodayTasks.slice(0, 4).map((task, i) => (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!task.projectId) {
                    setTaskStatus(task.id, task.completed ? undefined as any : 'terminée');
                  }
                }}
                className="glass-card-bright p-3.5 w-full flex items-center gap-3 text-left group"
              >
                {task.completed ? (
                  <div className="w-6 h-6 rounded-full gradient-fresh flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                ) : task.status === 'évitée' ? (
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <Circle size={14} className="text-destructive" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/60 transition-colors shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.name}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{task.category}</span>
                </div>
                <span className="text-xs font-mono font-bold text-foreground/60 shrink-0">{task.duration}m</span>
              </motion.button>
            ))}
            {allTodayTasks.length > 4 && (
              <p className="text-[10px] text-center text-muted-foreground">+{allTodayTasks.length - 4} autres tâches</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Routines Widget */}
      <motion.div variants={item} className="widget-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center">
              <Flame size={14} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-foreground/80">Routines</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-warning font-bold">{completedRoutines}</span>
            <span className="text-xs text-muted-foreground">/ {activeRoutines.length}</span>
          </div>
        </div>
        <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-warm"
            initial={{ width: 0 }}
            animate={{ width: `${routineRate * 100}%` }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </div>
        <div className="space-y-2">
          {activeRoutines.slice(0, 5).map((routine, i) => (
            <motion.button
              key={routine.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleRoutine(routine.id)}
              className="glass-card-bright p-3.5 w-full flex items-center gap-3 text-left group"
            >
              {routine.completed ? (
                <div className="w-6 h-6 rounded-full gradient-fresh flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-warning/60 transition-colors shrink-0" />
              )}
              <p className={`text-sm font-semibold flex-1 ${routine.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {routine.name}
              </p>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber/10">
                <Flame size={11} className="text-amber" />
                <span className="text-[10px] font-mono font-bold text-amber">{routine.streak}j</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Day Summary Widget */}
      <motion.div variants={item} className="widget-card relative">
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10 gradient-warm blur-3xl" />
        <div className="flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="font-semibold text-foreground/80">Bilan</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">Tâches <span className="font-bold text-primary">{Math.round(taskRate * 100)}%</span></span>
            <span className="font-mono">Routines <span className="font-bold text-accent">{Math.round(routineRate * 100)}%</span></span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
