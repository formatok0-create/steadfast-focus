import { motion } from 'framer-motion';
import { BarChart3, Clock, CheckCircle2, Flame, Target, Calendar } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const StatsScreen = () => {
  const { tasks, routines, projects, skills } = useAppStore();

  const totalTaskTime = tasks.reduce((a, t) => a + t.realDuration, 0);
  const completedTasks = tasks.filter(t => t.completed).length;
  const completedRoutines = routines.filter(r => r.completed).length;
  const activeProjects = projects.filter(p => p.status === 'en_cours').length;
  const totalProjectTime = projects.reduce((a, p) => a + p.realTime, 0);
  const avgStreak = routines.length > 0 ? Math.round(routines.reduce((a, r) => a + r.streak, 0) / routines.length) : 0;

  const stats = [
    { label: 'Temps travaillé', value: `${Math.floor(totalTaskTime / 60)}h${(totalTaskTime % 60).toString().padStart(2, '0')}`, icon: Clock, color: 'text-primary' },
    { label: 'Tâches complétées', value: `${completedTasks}/${tasks.length}`, icon: CheckCircle2, color: 'text-success' },
    { label: 'Routines validées', value: `${completedRoutines}/${routines.length}`, icon: Flame, color: 'text-warning' },
    { label: 'Projets actifs', value: `${activeProjects}`, icon: Target, color: 'text-primary' },
    { label: 'Temps projets', value: `${totalProjectTime}h`, icon: Calendar, color: 'text-accent' },
    { label: 'Streak moyen', value: `${avgStreak}j`, icon: Flame, color: 'text-warning' },
  ];

  // Engagement rate
  const engagementRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const routineRate = routines.length > 0 ? Math.round((completedRoutines / routines.length) * 100) : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de ta discipline</p>
      </motion.div>

      {/* Engagement cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="glass-card-elevated p-4 text-center">
          <p className="text-3xl font-bold font-mono text-foreground">{engagementRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Tâches respectées</p>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${engagementRate}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
        <div className="glass-card-elevated p-4 text-center">
          <p className="text-3xl font-bold font-mono text-foreground">{routineRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Routines respectées</p>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-warning rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${routineRate}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="space-y-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                <Icon size={18} className={stat.color} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Skills progress */}
      <motion.div variants={item} className="glass-card-elevated p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground/80">Compétences — Temps cumulé</span>
        </div>
        {skills.map(skill => (
          <div key={skill.id} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground">{skill.name}</span>
              <span className="font-mono text-muted-foreground">{skill.realTime}h / {skill.weeklyTarget * 4}h</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((skill.realTime / (skill.weeklyTarget * 4)) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
