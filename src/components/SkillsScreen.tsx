import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const levelColors = {
  'débutant': 'text-accent',
  'intermédiaire': 'text-primary',
  'avancé': 'text-success',
};

export const SkillsScreen = () => {
  const { skills } = useAppStore();
  const activeSkills = skills.filter(s => s.active);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Compétences</h1>
        <p className="text-sm text-muted-foreground mt-1">{activeSkills.length}/2 actives — max 2 en parallèle</p>
      </motion.div>

      {skills.map((skill) => (
        <motion.div key={skill.id} variants={item} className="glass-card-elevated p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">{skill.name}</h3>
            </div>
            <span className={`text-xs font-semibold ${levelColors[skill.level]}`}>{skill.level}</span>
          </div>

          <p className="text-xs text-muted-foreground">{skill.objective}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{skill.realTime}h</p>
              <p className="text-[10px] text-muted-foreground">Temps cumulé</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-muted-foreground">{skill.weeklyTarget}h</p>
              <p className="text-[10px] text-muted-foreground">Objectif / semaine</p>
            </div>
          </div>

          {/* Visual bar */}
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
              <TrendingUp size={12} />
              <span>Progression hebdo</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-glass-highlight rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((skill.realTime / (skill.weeklyTarget * 4)) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
