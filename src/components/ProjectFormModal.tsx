import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarIcon } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Project } from '@/types/app';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ImagePicker } from '@/components/ImagePicker';

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
}

export const ProjectFormModal = ({ open, onClose, project }: ProjectFormModalProps) => {
  const { addProject, updateProject } = useAppStore();
  const isEdit = !!project;

  const [name, setName] = useState(project?.name ?? '');
  const [objective, setObjective] = useState(project?.objective ?? '');
  const [priority, setPriority] = useState<Project['priority']>(project?.priority ?? 'moyenne');
  const [startDate, setStartDate] = useState<Date | undefined>(project ? new Date(project.startDate) : new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(project ? new Date(project.endDate) : undefined);
  const [dailyStartTime, setDailyStartTime] = useState(project?.dailyStartTime ?? '');
  const [dailyEndTime, setDailyEndTime] = useState(project?.dailyEndTime ?? '');
  const [estimatedTime, setEstimatedTime] = useState(project?.estimatedTime?.toString() ?? '');
  const [status, setStatus] = useState<Project['status']>(project?.status ?? 'en_cours');
  const [imageUrl, setImageUrl] = useState<string | undefined>(project?.imageUrl);

  const canSubmit = name.trim().length > 0 && objective.trim().length > 0 && estimatedTime.length > 0 && startDate && endDate;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const data = {
      name: name.trim(),
      objective: objective.trim(),
      priority,
      startDate: format(startDate!, 'yyyy-MM-dd'),
      endDate: format(endDate!, 'yyyy-MM-dd'),
      dailyStartTime: dailyStartTime || undefined,
      dailyEndTime: dailyEndTime || undefined,
      estimatedTime: parseInt(estimatedTime),
      status,
      imageUrl,
    };
    if (isEdit) {
      updateProject(project.id, data);
    } else {
      addProject(data);
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
            className="fixed inset-x-3 bottom-0 top-16 z-50 glass-card-elevated rounded-t-3xl overflow-y-auto p-5 pb-24 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Modifier le projet' : 'Nouveau projet'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
                <X size={16} />
              </button>
            </div>
            {/* Image */}
            <ImagePicker value={imageUrl} onChange={setImageUrl} label="Logo du projet" />

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Nom du projet *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: App Mobile Discipline"
                maxLength={100}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Objective */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Objectif final *</label>
              <input
                value={objective}
                onChange={e => setObjective(e.target.value)}
                placeholder="Ex: MVP fonctionnel livré"
                maxLength={200}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Priorité</label>
              <div className="flex gap-2">
                {(['haute', 'moyenne', 'basse'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      priority === p ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Date début *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      "w-full bg-muted/50 border border-border rounded-xl px-3 py-3 text-xs font-mono text-left flex items-center gap-2",
                      !startDate && "text-muted-foreground"
                    )}>
                      <CalendarIcon size={14} />
                      {startDate ? format(startDate, 'dd/MM/yyyy') : 'Choisir'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Date fin *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      "w-full bg-muted/50 border border-border rounded-xl px-3 py-3 text-xs font-mono text-left flex items-center gap-2",
                      !endDate && "text-muted-foreground"
                    )}>
                      <CalendarIcon size={14} />
                      {endDate ? format(endDate, 'dd/MM/yyyy') : 'Choisir'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Daily work hours */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Heure début</label>
                <input
                  type="time"
                  value={dailyStartTime}
                  onChange={e => setDailyStartTime(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Heure fin</label>
                <input
                  type="time"
                  value={dailyEndTime}
                  onChange={e => setDailyEndTime(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-3">Optionnel — créneau de travail quotidien dédié au projet</p>

            {/* Estimated time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Temps global estimé (heures) *</label>
              <input
                type="number"
                value={estimatedTime}
                onChange={e => setEstimatedTime(e.target.value)}
                placeholder="Ex: 120"
                min={1}
                max={9999}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {/* Status (edit only) */}
            {isEdit && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Statut</label>
                <div className="flex gap-2">
                  {(['en_cours', 'en_pause', 'terminé'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        status === s ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                canSubmit
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isEdit ? 'Enregistrer' : 'Créer le projet'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
