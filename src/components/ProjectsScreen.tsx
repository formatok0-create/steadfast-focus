import { motion } from 'framer-motion';
import { Clock, ArrowRight, Pause, Play } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const statusConfig = {
  en_cours: { label: 'En cours', color: 'text-primary', icon: Play },
  en_pause: { label: 'En pause', color: 'text-warning', icon: Pause },
  terminé: { label: 'Terminé', color: 'text-success', icon: null },
};

export const ProjectsScreen = () => {
  const { projects } = useAppStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
        <p className="text-sm text-muted-foreground mt-1">{projects.length} projets actifs</p>
      </motion.div>

      {projects.map((project) => {
        const progress = Math.min((project.realTime / project.estimatedTime) * 100, 100);
        const cfg = statusConfig[project.status];
        return (
          <motion.div key={project.id} variants={item} className="glass-card-elevated p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{project.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{project.objective}</p>
              </div>
              <span className={`text-xs font-semibold ${cfg.color} flex items-center gap-1`}>
                {cfg.icon && <cfg.icon size={12} />}
                {cfg.label}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={12} />
                <span className="font-mono">{project.realTime}h / {project.estimatedTime}h</span>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                project.priority === 'haute' ? 'bg-destructive/15 text-destructive' :
                project.priority === 'moyenne' ? 'bg-warning/15 text-warning' :
                'bg-muted text-muted-foreground'
              }`}>
                {project.priority}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progression</span>
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

            <button className="flex items-center gap-1 text-xs text-primary font-medium">
              Voir les détails <ArrowRight size={12} />
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
