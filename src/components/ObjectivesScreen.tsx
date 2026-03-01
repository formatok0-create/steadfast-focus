import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const ObjectivesScreen = () => {
  const { objectives } = useAppStore();
  const current = objectives[0]; // current month

  if (!current) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold tracking-tight">Objectifs du Mois</h1>
          <p className="text-sm text-muted-foreground mt-1">Aucun objectif défini</p>
        </motion.div>
      </motion.div>
    );
  }

  const resultStyles = {
    réussi: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    partiel: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    échoué: { icon: Target, color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Objectifs du Mois</h1>
        <p className="text-sm text-muted-foreground mt-1">Mars 2026</p>
      </motion.div>

      {/* Main objective */}
      <motion.div variants={item} className="glass-card-elevated p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-primary" />
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Objectif principal</span>
        </div>
        <p className="text-base font-semibold text-foreground leading-relaxed">{current.main}</p>
        {current.result && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${resultStyles[current.result].color} ${resultStyles[current.result].bg}`}>
            {(() => { const R = resultStyles[current.result].icon; return <R size={12} />; })()}
            {current.result}
          </div>
        )}
      </motion.div>

      {/* Secondary */}
      {current.secondary.length > 0 && (
        <motion.div variants={item} className="glass-card p-4 space-y-3">
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Objectifs secondaires</span>
          <div className="space-y-2">
            {current.secondary.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground">{s}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Habit to reinforce */}
      <motion.div variants={item} className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-success" />
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Habitude à renforcer</span>
        </div>
        <p className="text-sm text-foreground">{current.habitToReinforce}</p>
      </motion.div>

      {/* Behavior to eliminate */}
      <motion.div variants={item} className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-destructive" />
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Comportement à éliminer</span>
        </div>
        <p className="text-sm text-foreground">{current.behaviorToEliminate}</p>
      </motion.div>

      {/* Review */}
      {current.review && (
        <motion.div variants={item} className="glass-card p-4 space-y-2">
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Bilan</span>
          <p className="text-sm text-muted-foreground italic">{current.review}</p>
          {current.lesson && (
            <p className="text-sm text-foreground mt-2">Leçon : {current.lesson}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
