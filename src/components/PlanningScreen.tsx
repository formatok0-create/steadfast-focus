import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h to 20h

const blocks = [
  { start: 7, end: 8, label: 'Routine matin', type: 'routine' },
  { start: 8, end: 9.5, label: 'Refactoring API module', type: 'project' },
  { start: 9.5, end: 10.5, label: 'Maquette écran profil', type: 'project' },
  { start: 11, end: 11.75, label: 'Cours React — Module 4', type: 'formation' },
  { start: 14, end: 15, label: 'Sport', type: 'routine' },
  { start: 19, end: 19.5, label: 'Revue de journée', type: 'routine' },
];

const typeStyles: Record<string, string> = {
  routine: 'bg-accent/15 border-accent/30 text-accent',
  project: 'bg-primary/15 border-primary/30 text-primary',
  formation: 'bg-success/15 border-success/30 text-success',
};

export const PlanningScreen = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Planning</h1>
        <p className="text-sm text-muted-foreground mt-1">Dimanche 1 Mars</p>
      </motion.div>

      {/* Day selector */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <button
            key={i}
            className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-medium shrink-0 transition-colors ${
              i === 6 ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            <span>{d}</span>
            <span className="font-mono text-[10px]">{24 + i}</span>
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <motion.div variants={item} className="glass-card p-4 space-y-0">
        {hours.map((hour) => {
          const block = blocks.find(b => b.start === hour || (b.start < hour && b.end > hour && b.start === Math.floor(b.start) && Math.floor(b.start) === hour));
          const activeBlock = blocks.find(b => b.start === hour);

          return (
            <div key={hour} className="flex gap-3 min-h-[48px]">
              <div className="w-10 shrink-0 text-right">
                <span className="text-[10px] font-mono text-muted-foreground">{hour}:00</span>
              </div>
              <div className="flex-1 border-l border-border/40 pl-3 pb-2">
                {activeBlock ? (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium ${typeStyles[activeBlock.type]}`}
                  >
                    {activeBlock.label}
                    <span className="block text-[10px] opacity-60 mt-0.5 font-mono">
                      {Math.floor(activeBlock.start)}:{(activeBlock.start % 1) * 60 || '00'} — {Math.floor(activeBlock.end)}:{(activeBlock.end % 1) * 60 || '00'}
                    </span>
                  </motion.div>
                ) : (
                  <div className="h-full" />
                )}
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
