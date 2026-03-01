import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, Sun, Moon, Dumbbell, Brain, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const categoryConfig = {
  matin: { label: 'Matin', icon: Sun, color: 'text-warning' },
  soir: { label: 'Soir', icon: Moon, color: 'text-accent' },
  corps: { label: 'Corps', icon: Dumbbell, color: 'text-success' },
  esprit: { label: 'Esprit', icon: Brain, color: 'text-primary' },
  spirituel: { label: 'Spirituel', icon: Sparkles, color: 'text-accent' },
};

export const RoutinesScreen = () => {
  const { routines, toggleRoutine } = useAppStore();
  const completed = routines.filter(r => r.completed).length;
  const categories = ['matin', 'corps', 'esprit', 'spirituel', 'soir'] as const;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Routines</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {completed}/{routines.length} validées · Constance quotidienne
        </p>
      </motion.div>

      {/* Streak overview */}
      <motion.div variants={item} className="glass-card-elevated p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-warning" />
          <span className="text-sm font-semibold text-foreground/80">Streaks actifs</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {routines.filter(r => r.streak > 0).sort((a, b) => b.streak - a.streak).map(r => (
            <div key={r.id} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <span className="text-sm font-bold font-mono text-warning">{r.streak}</span>
              </div>
              <span className="text-[9px] text-muted-foreground text-center max-w-[56px] truncate">{r.name.split('—')[0].trim()}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grouped by category */}
      {categories.map(cat => {
        const catRoutines = routines.filter(r => r.category === cat);
        if (catRoutines.length === 0) return null;
        const cfg = categoryConfig[cat];
        const CatIcon = cfg.icon;

        return (
          <motion.div key={cat} variants={item}>
            <div className="flex items-center gap-2 mb-2">
              <CatIcon size={14} className={cfg.color} />
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">{cfg.label}</span>
            </div>
            <div className="space-y-2">
              {catRoutines.map(routine => (
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
                  </div>
                  <div className="flex items-center gap-1 text-xs text-accent shrink-0">
                    <Flame size={12} />
                    <span className="font-mono">{routine.streak}j</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
