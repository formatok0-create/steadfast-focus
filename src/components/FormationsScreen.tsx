import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Circle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';
import type { Formation } from '@/types/app';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const FormationsScreen = () => {
  const { formations, skills } = useAppStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Formations</h1>
        <p className="text-sm text-muted-foreground mt-1">{formations.length} formations en cours</p>
      </motion.div>

      {formations.map(formation => (
        <motion.div key={formation.id} variants={item}>
          <FormationCard formation={formation} skillName={skills.find(s => s.id === formation.skillId)?.name} />
        </motion.div>
      ))}
    </motion.div>
  );
};

const FormationCard = ({ formation, skillName }: { formation: Formation; skillName?: string }) => {
  const [expanded, setExpanded] = useState(false);

  const allSessions = formation.modules.flatMap(m => m.sessions);
  const completedSessions = allSessions.filter(s => s.completed).length;
  const totalSessions = allSessions.length;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const totalRealMin = allSessions.reduce((a, s) => a + s.realDuration, 0);
  const totalPlannedMin = allSessions.reduce((a, s) => a + s.duration, 0);

  const statusStyles = {
    en_cours: 'text-primary',
    en_pause: 'text-warning',
    terminée: 'text-success',
  };

  return (
    <div className="glass-card-elevated p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary shrink-0" />
            <h3 className="font-semibold text-foreground truncate">{formation.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{formation.objective}</p>
          {skillName && (
            <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {skillName}
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold ${statusStyles[formation.status]} shrink-0 ml-2`}>
          {formation.status.replace('_', ' ')}
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{completedSessions}/{totalSessions} séances</span>
          <span className="font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Time stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span className="font-mono">{Math.floor(totalRealMin / 60)}h{(totalRealMin % 60).toString().padStart(2, '0')} réel</span>
        </div>
        <span className="font-mono">{Math.floor(totalPlannedMin / 60)}h{(totalPlannedMin % 60).toString().padStart(2, '0')} prévu</span>
      </div>

      {/* Expand modules */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary font-medium"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {expanded ? 'Masquer les modules' : 'Voir les modules'}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3 pt-2 border-t border-border/50"
        >
          {formation.modules.map(mod => (
            <div key={mod.id} className="space-y-2">
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">{mod.name}</p>
              {mod.sessions.map(session => (
                <div key={session.id} className="flex items-center gap-2 pl-2">
                  {session.completed ? (
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                  ) : (
                    <Circle size={14} className="text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-xs flex-1 ${session.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {session.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{session.duration}m</span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
