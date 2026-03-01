import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarIcon, Edit3 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Task } from '@/types/app';

const CATEGORIES = ['Développement', 'Design', 'Recherche', 'Documentation', 'Test', 'Autre'];

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null;
}

export const ProjectTaskFormModal = ({ open, onClose, projectId, task }: Props) => {
  const { addProjectTask, updateProjectTask } = useAppStore();
  const isEdit = !!task;

  const [name, setName] = useState('');
  const [day, setDay] = useState<Date | undefined>(new Date());
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [strict, setStrict] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDay(new Date(task.day));
      setDuration(String(task.duration));
      setCategory(task.category);
      setStrict(task.strict);
    } else {
      setName(''); setDay(new Date()); setDuration(''); setCategory(CATEGORIES[0]); setStrict(false);
    }
  }, [task, open]);

  const canSubmit = name.trim().length > 0 && duration.length > 0 && parseInt(duration) > 0 && day;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const data = {
      name: name.trim(),
      day: format(day!, 'yyyy-MM-dd'),
      duration: parseInt(duration),
      category,
      strict,
      projectId,
    };
    if (isEdit && task) {
      updateProjectTask(projectId, task.id, data);
    } else {
      addProjectTask(projectId, data);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-3 bottom-0 z-50 glass-card-elevated rounded-t-3xl overflow-y-auto p-5 space-y-5 max-h-[80vh]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
                <X size={16} />
              </motion.button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Nom *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Implémenter l'auth"
                maxLength={100}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Day */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Jour *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-left flex items-center gap-2",
                    !day && "text-muted-foreground"
                  )}>
                    <CalendarIcon size={14} className="text-primary" />
                    {day ? format(day, 'PPP', { locale: fr }) : 'Choisir'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={day} onSelect={setDay} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Durée (minutes) *</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="Ex: 60"
                min={1}
                max={480}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      category === cat ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Strict */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStrict(!strict)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                strict ? 'bg-warning/10 border border-warning/30' : 'bg-muted/50 border border-border'
              }`}
            >
              <div className="text-left">
                <p className="text-sm text-foreground">Mode strict</p>
                <p className="text-[10px] text-muted-foreground">Durée non modifiable</p>
              </div>
              <span className={`text-xs font-bold ${strict ? 'text-warning' : 'text-muted-foreground'}`}>
                {strict ? 'OUI' : 'NON'}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                canSubmit ? 'gradient-primary text-white shadow-lg glow-primary' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isEdit ? 'Enregistrer' : 'Ajouter la tâche'}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
