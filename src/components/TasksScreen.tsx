import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Pause, Square, CheckCircle2, Circle, Clock, Trash2, AlertTriangle, Ban, ChevronDown, X, CalendarIcon } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Task } from '@/types/app';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CATEGORIES = ['Développement', 'Design', 'Formation', 'Recherche', 'Admin', 'Personnel', 'Autre'];

export const TasksScreen = () => {
  const { tasks, settings, setTaskStatus, deleteTask } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'));

  const dayTasks = tasks.filter(t => t.day === selectedDay);
  const completed = dayTasks.filter(t => t.completed).length;
  const avoided = dayTasks.filter(t => t.status === 'évitée').length;
  const totalPlanned = dayTasks.reduce((a, t) => a + t.duration, 0);
  const totalReal = dayTasks.reduce((a, t) => a + t.realDuration, 0);
  const atLimit = dayTasks.length >= settings.maxTasksPerDay;

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tâches</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completed}/{dayTasks.length} terminées · {totalPlanned} min prévues
              {avoided > 0 && <span className="text-destructive"> · {avoided} évitée{avoided > 1 ? 's' : ''}</span>}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={atLimit}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              atLimit ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary/15 text-primary'
            }`}
          >
            <Plus size={20} />
          </button>
        </motion.div>

        {/* Daily limit indicator */}
        <motion.div variants={item} className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {dayTasks.length}/{settings.maxTasksPerDay} tâches (limite jour)
          </span>
          <div className="flex gap-1">
            {Array.from({ length: settings.maxTasksPerDay }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < dayTasks.length
                    ? i < completed ? 'bg-success' : 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Time comparison */}
        <motion.div variants={item} className="glass-card-elevated p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground/80">Temps du jour</span>
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-2xl font-bold font-mono text-foreground">
                {Math.floor(totalReal / 60)}h{(totalReal % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-[10px] text-muted-foreground">Réel</p>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <p className="text-2xl font-bold font-mono text-muted-foreground">
                {Math.floor(totalPlanned / 60)}h{(totalPlanned % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-[10px] text-muted-foreground">Prévu</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${totalReal > totalPlanned ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-accent'}`}
              initial={{ width: 0 }}
              animate={{ width: `${totalPlanned > 0 ? Math.min((totalReal / totalPlanned) * 100, 100) : 0}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={item} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground/80">Timeline</span>
          </div>
          {dayTasks.length > 0 ? (
            <div className="flex gap-1 h-8">
              {dayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  className={`rounded-md flex items-center justify-center text-[9px] font-mono ${
                    task.completed ? 'bg-success/20 text-success' :
                    task.status === 'évitée' ? 'bg-destructive/20 text-destructive' :
                    'bg-primary/15 text-primary'
                  }`}
                  style={{ flex: task.duration }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {task.duration}m
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Aucune tâche pour ce jour</p>
          )}
        </motion.div>

        {/* Task list */}
        {dayTasks.map((task) => (
          <motion.div key={task.id} variants={item}>
            <TaskCard task={task} />
          </motion.div>
        ))}

        {dayTasks.length === 0 && (
          <motion.div variants={item} className="glass-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune tâche pour ce jour. Ajoute ta première tâche.</p>
          </motion.div>
        )}
      </motion.div>

      <TaskFormModal open={showCreateModal} onClose={() => setShowCreateModal(false)} defaultDay={selectedDay} />
    </>
  );
};

// ===== TASK CARD WITH CHRONO & STATUS =====
const TaskCard = ({ task }: { task: Task }) => {
  const { setTaskStatus, deleteTask, addTaskTimerSession } = useAppStore();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAvoidModal, setShowAvoidModal] = useState(false);
  const [avoidReason, setAvoidReason] = useState('');

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = () => {
    setRunning(true);
    setSessionStart(Date.now());
  };

  const handlePause = () => setRunning(false);

  const handleStop = () => {
    if (elapsed > 0 && sessionStart) {
      const sessionDurationMin = Math.round(elapsed / 60);
      if (sessionDurationMin > 0) {
        addTaskTimerSession(task.id, {
          id: Math.random().toString(36).slice(2, 10),
          startTime: sessionStart,
          endTime: Date.now(),
          duration: sessionDurationMin,
        });
      }
    }
    setRunning(false);
    setElapsed(0);
    setSessionStart(null);
  };

  const handleSetAvoided = () => {
    if (avoidReason.trim().length === 0) return;
    setTaskStatus(task.id, 'évitée', avoidReason.trim());
    setShowAvoidModal(false);
    setAvoidReason('');
  };

  const totalReal = task.realDuration + Math.round(elapsed / 60);
  const overTime = totalReal > task.duration;

  const statusIcon = task.status === 'terminée' || task.completed
    ? <CheckCircle2 size={20} className="text-success" />
    : task.status === 'évitée'
    ? <Ban size={20} className="text-destructive" />
    : task.status === 'incomplète'
    ? <AlertTriangle size={20} className="text-warning" />
    : <Circle size={20} className="text-muted-foreground" />;

  const statusLabel = task.status === 'terminée' || task.completed ? 'Terminée'
    : task.status === 'évitée' ? 'Évitée'
    : task.status === 'incomplète' ? 'Incomplète'
    : 'En attente';

  const statusColor = task.status === 'terminée' || task.completed ? 'text-success'
    : task.status === 'évitée' ? 'text-destructive'
    : task.status === 'incomplète' ? 'text-warning'
    : 'text-muted-foreground';

  return (
    <>
      <div className="glass-card-elevated p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowStatusMenu(!showStatusMenu)}>
            {statusIcon}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.name}
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{task.category}</span>
              {task.strict && <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-semibold">STRICT</span>}
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColor} bg-current/10`}>{statusLabel}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-mono text-muted-foreground">{task.duration}m</p>
            <p className={`text-[10px] font-mono ${overTime ? 'text-destructive' : 'text-success'}`}>
              {totalReal}m réel
            </p>
          </div>
        </div>

        {/* Status menu */}
        <AnimatePresence>
          {showStatusMenu && !task.completed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-hidden"
            >
              <button
                onClick={() => { setTaskStatus(task.id, 'terminée'); setShowStatusMenu(false); }}
                className="flex-1 py-2 rounded-lg bg-success/10 text-success text-[10px] font-semibold"
              >
                ✅ Terminée
              </button>
              <button
                onClick={() => { setTaskStatus(task.id, 'incomplète'); setShowStatusMenu(false); }}
                className="flex-1 py-2 rounded-lg bg-warning/10 text-warning text-[10px] font-semibold"
              >
                ⚠️ Incomplète
              </button>
              <button
                onClick={() => { setShowAvoidModal(true); setShowStatusMenu(false); }}
                className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-[10px] font-semibold"
              >
                🚫 Évitée
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avoid reason display */}
        {task.status === 'évitée' && task.avoidReason && (
          <div className="bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
            <p className="text-[10px] text-destructive font-medium">Raison : {task.avoidReason}</p>
          </div>
        )}

        {/* Chrono */}
        {!task.completed && task.status !== 'évitée' && (
          <div className="pt-2 border-t border-border/50 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className={`text-2xl font-mono font-bold ${overTime ? 'text-destructive' : 'text-foreground'}`}>
                  {formatTime(elapsed)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Total : {totalReal} / {task.duration} min
                </p>
              </div>
              <div className="flex gap-2">
                {!running ? (
                  <button onClick={handleStart} className="p-3 rounded-xl bg-primary/15 text-primary">
                    <Play size={18} />
                  </button>
                ) : (
                  <button onClick={handlePause} className="p-3 rounded-xl bg-warning/15 text-warning">
                    <Pause size={18} />
                  </button>
                )}
                {(elapsed > 0 || running) && (
                  <button onClick={handleStop} className="p-3 rounded-xl bg-destructive/10 text-destructive">
                    <Square size={18} />
                  </button>
                )}
              </div>
            </div>
            {overTime && (
              <p className="text-[10px] text-destructive font-semibold">⚠ Dépassement du temps estimé</p>
            )}
          </div>
        )}

        {/* Session history */}
        {task.sessions.length > 0 && (
          <div className="pt-2 border-t border-border/50 space-y-1.5">
            <span className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">Sessions</span>
            {task.sessions.map((session, i) => (
              <div key={session.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="w-4 h-4 rounded bg-muted flex items-center justify-center font-mono text-foreground/60 text-[8px]">{i + 1}</div>
                <span className="font-mono">{format(new Date(session.startTime), 'HH:mm', { locale: fr })}</span>
                <span className="text-foreground/40">→</span>
                <span className="font-mono">{session.endTime ? format(new Date(session.endTime), 'HH:mm', { locale: fr }) : '—'}</span>
                <span className="ml-auto font-mono text-foreground">{session.duration}m</span>
              </div>
            ))}
          </div>
        )}

        {/* Delete */}
        <button
          onClick={() => deleteTask(task.id)}
          className="flex items-center gap-1 text-[10px] text-destructive/60 font-medium pt-1"
        >
          <Trash2 size={10} />
          Supprimer
        </button>
      </div>

      {/* Avoid reason modal */}
      <AnimatePresence>
        {showAvoidModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvoidModal(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-24 z-50 glass-card-elevated p-5 space-y-4 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Pourquoi cette tâche a été évitée ?</h3>
                <button onClick={() => setShowAvoidModal(false)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <X size={14} className="text-foreground" />
                </button>
              </div>
              <textarea
                value={avoidReason}
                onChange={e => setAvoidReason(e.target.value)}
                placeholder="Raison honnête..."
                maxLength={200}
                rows={3}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <button
                onClick={handleSetAvoided}
                disabled={avoidReason.trim().length === 0}
                className={`w-full py-3 rounded-xl text-sm font-semibold ${
                  avoidReason.trim().length > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Confirmer
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ===== CREATE TASK MODAL =====
const TaskFormModal = ({ open, onClose, defaultDay }: { open: boolean; onClose: () => void; defaultDay: string }) => {
  const { addTask, settings, tasks } = useAppStore();

  const [name, setName] = useState('');
  const [day, setDay] = useState<Date | undefined>(new Date(defaultDay));
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [strict, setStrict] = useState(false);

  const dayStr = day ? format(day, 'yyyy-MM-dd') : '';
  const dayTaskCount = tasks.filter(t => t.day === dayStr).length;
  const atLimit = dayTaskCount >= settings.maxTasksPerDay;

  const canSubmit = name.trim().length > 0 && duration.length > 0 && parseInt(duration) > 0 && day && !atLimit;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addTask({
      name: name.trim(),
      day: dayStr,
      duration: parseInt(duration),
      category,
      strict,
    });
    setName('');
    setDuration('');
    setStrict(false);
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
              <h2 className="text-lg font-bold text-foreground">Nouvelle tâche</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
                <X size={16} />
              </button>
            </div>

            {atLimit && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl px-3 py-2">
                <p className="text-xs text-warning font-semibold">⚠ Limite atteinte ({settings.maxTasksPerDay} tâches/jour)</p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Nom *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Rédiger documentation API"
                maxLength={100}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Day */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Jour *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full bg-muted/50 border border-border rounded-xl px-3 py-3 text-xs font-mono text-left flex items-center gap-2",
                    !day && "text-muted-foreground"
                  )}>
                    <CalendarIcon size={14} />
                    {day ? format(day, 'dd/MM/yyyy') : 'Choisir'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={day} onSelect={setDay} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Durée (minutes) *</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="Ex: 60"
                min={1}
                max={480}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              {duration.length > 0 && parseInt(duration) <= 0 && (
                <p className="text-[10px] text-destructive">Impossible de créer une tâche sans durée</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === cat ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Strict */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Mode strict</p>
                <p className="text-[10px] text-muted-foreground">Durée obligatoire non modifiable</p>
              </div>
              <button
                onClick={() => setStrict(!strict)}
                className={`w-12 h-7 rounded-full transition-colors relative ${strict ? 'bg-warning' : 'bg-muted'}`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-foreground absolute top-1"
                  animate={{ left: strict ? 26 : 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                canSubmit ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Créer la tâche
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
