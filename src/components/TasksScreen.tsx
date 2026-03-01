import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Pause, Square, CheckCircle2, Circle, Clock, Trash2, AlertTriangle, Ban, ChevronDown, X, CalendarIcon, ListTodo, TrendingUp, Zap, Edit3 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Task } from '@/types/app';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const CATEGORIES = ['Développement', 'Design', 'Formation', 'Recherche', 'Admin', 'Personnel', 'Autre'];

export const TasksScreen = () => {
  const { tasks, settings, setTaskStatus, deleteTask } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
            <h1 className="text-3xl font-extrabold tracking-tight">Tâches<span className="text-gradient">.</span></h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completed}/{dayTasks.length} terminées · {totalPlanned} min prévues
              {avoided > 0 && <span className="text-destructive"> · {avoided} évitée{avoided > 1 ? 's' : ''}</span>}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateModal(true)}
            disabled={atLimit}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
              atLimit ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'gradient-primary text-white glow-primary'
            }`}
          >
            <Plus size={20} />
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <div className="stat-card stat-card-blue text-center">
            <ListTodo size={18} className="mx-auto mb-2 text-primary" />
            <p className="text-2xl font-black text-foreground">{dayTasks.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Tâches</p>
          </div>
          <div className="stat-card stat-card-green text-center">
            <CheckCircle2 size={18} className="mx-auto mb-2 text-success" />
            <p className="text-2xl font-black text-foreground">{completed}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Terminées</p>
          </div>
          <div className="stat-card stat-card-violet text-center">
            <Zap size={18} className="mx-auto mb-2 text-accent" />
            <p className="text-2xl font-black text-foreground">{dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0}%</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Taux</p>
          </div>
        </motion.div>

        {/* Daily limit indicator */}
        <motion.div variants={item} className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-medium">
            {dayTasks.length}/{settings.maxTasksPerDay} tâches (limite jour)
          </span>
          <div className="flex gap-1">
            {Array.from({ length: settings.maxTasksPerDay }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < dayTasks.length
                    ? i < completed ? 'bg-success glow-success' : 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Time comparison */}
        <motion.div variants={item} className="glass-card-elevated p-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 gradient-cool blur-3xl" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg gradient-cool flex items-center justify-center">
              <Clock size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-foreground/80">Temps du jour</span>
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-3xl font-black font-mono text-foreground">
                {Math.floor(totalReal / 60)}<span className="text-primary">h</span>{(totalReal % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-[10px] text-muted-foreground">Réel</p>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <p className="text-xl font-bold font-mono text-muted-foreground">
                {Math.floor(totalPlanned / 60)}h{(totalPlanned % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-[10px] text-muted-foreground">Prévu</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${totalReal > totalPlanned ? 'bg-destructive' : 'gradient-cool'}`}
              initial={{ width: 0 }}
              animate={{ width: `${totalPlanned > 0 ? Math.min((totalReal / totalPlanned) * 100, 100) : 0}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={item} className="glass-card-bright p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground/80">Timeline</span>
          </div>
          {dayTasks.length > 0 ? (
            <div className="flex gap-1 h-8">
              {dayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  className={`rounded-lg flex items-center justify-center text-[9px] font-mono font-bold ${
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
            <TaskCard task={task} onEdit={() => setEditingTask(task)} />
          </motion.div>
        ))}

        {dayTasks.length === 0 && (
          <motion.div variants={item} className="glass-card-bright p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 gradient-primary" />
            <ListTodo size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucune tâche pour ce jour. Ajoute ta première tâche.</p>
          </motion.div>
        )}
      </motion.div>

      <TaskFormModal
        open={showCreateModal || !!editingTask}
        onClose={() => { setShowCreateModal(false); setEditingTask(null); }}
        defaultDay={selectedDay}
        task={editingTask}
      />
    </>
  );
};

// ===== TASK CARD WITH CHRONO & STATUS =====
const TaskCard = ({ task, onEdit }: { task: Task; onEdit: () => void }) => {
  const { setTaskStatus, deleteTask, addTaskTimerSession } = useAppStore();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAvoidModal, setShowAvoidModal] = useState(false);
  const [avoidReason, setAvoidReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    ? <div className="w-6 h-6 rounded-full gradient-fresh flex items-center justify-center"><CheckCircle2 size={14} className="text-white" /></div>
    : task.status === 'évitée'
    ? <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center"><Ban size={14} className="text-destructive" /></div>
    : task.status === 'incomplète'
    ? <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center"><AlertTriangle size={14} className="text-warning" /></div>
    : <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />;

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
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="glass-card-elevated p-4 space-y-3"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowStatusMenu(!showStatusMenu)}>
            {statusIcon}
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.name}
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{task.category}</span>
              {task.strict && <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-bold">STRICT</span>}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor} bg-current/10`}>{statusLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              {task.startTime && task.endTime && (
                <p className="text-xs font-mono font-bold text-foreground">{task.startTime} → {task.endTime}</p>
              )}
              <p className="text-[10px] font-mono text-muted-foreground">{task.duration}min</p>
              <p className={`text-[10px] font-mono font-bold ${overTime ? 'text-destructive' : 'text-success'}`}>
                {totalReal}m réel
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onEdit}
              className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit3 size={12} />
            </motion.button>
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
              {[
                { status: 'terminée' as const, label: '✅ Terminée', cls: 'bg-success/10 text-success' },
                { status: 'incomplète' as const, label: '⚠️ Incomplète', cls: 'bg-warning/10 text-warning' },
              ].map(s => (
                <motion.button
                  key={s.status}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setTaskStatus(task.id, s.status); setShowStatusMenu(false); }}
                  className={`flex-1 py-2.5 rounded-xl ${s.cls} text-[10px] font-bold`}
                >
                  {s.label}
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowAvoidModal(true); setShowStatusMenu(false); }}
                className="flex-1 py-2.5 rounded-xl bg-destructive/10 text-destructive text-[10px] font-bold"
              >
                🚫 Évitée
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avoid reason display */}
        {task.status === 'évitée' && task.avoidReason && (
          <div className="bg-destructive/5 border border-destructive/10 rounded-xl px-3 py-2">
            <p className="text-[10px] text-destructive font-medium">Raison : {task.avoidReason}</p>
          </div>
        )}

        {/* Chrono */}
        {!task.completed && task.status !== 'évitée' && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className={`text-2xl font-mono font-black ${overTime ? 'text-destructive' : running ? 'text-primary' : 'text-foreground'}`}>
                  {formatTime(elapsed)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Total : {totalReal} / {task.duration} min
                </p>
              </div>
              <div className="flex gap-2">
                {!running ? (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleStart} className="p-3 rounded-2xl gradient-cool text-white shadow-lg">
                    <Play size={18} />
                  </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePause} className="p-3 rounded-2xl bg-warning/15 text-warning">
                    <Pause size={18} />
                  </motion.button>
                )}
                {(elapsed > 0 || running) && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleStop} className="p-3 rounded-2xl bg-destructive/10 text-destructive">
                    <Square size={18} />
                  </motion.button>
                )}
              </div>
            </div>
            {overTime && (
              <p className="text-[10px] text-destructive font-bold">⚠ Dépassement du temps estimé</p>
            )}
          </div>
        )}

        {/* Session history */}
        {task.sessions.length > 0 && (
          <div className="pt-2 border-t border-border/50 space-y-1.5">
            <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Sessions</span>
            {task.sessions.map((session, i) => (
              <div key={session.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center font-mono text-primary text-[8px] font-bold">{i + 1}</div>
                <span className="font-mono">{format(new Date(session.startTime), 'HH:mm', { locale: fr })}</span>
                <span className="text-foreground/40">→</span>
                <span className="font-mono">{session.endTime ? format(new Date(session.endTime), 'HH:mm', { locale: fr }) : '—'}</span>
                <span className="ml-auto font-mono text-foreground font-semibold">{session.duration}m</span>
              </div>
            ))}
          </div>
        )}

        {/* Delete */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1 text-[10px] text-destructive/60 font-medium pt-1 hover:text-destructive transition-colors"
        >
          <Trash2 size={10} />
          Supprimer
        </motion.button>

        <ConfirmDeleteModal
          open={confirmDelete}
          title="Supprimer cette tâche ?"
          message="La tâche et ses sessions seront supprimées."
          onConfirm={() => { deleteTask(task.id); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      </motion.div>

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
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAvoidModal(false)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <X size={14} className="text-foreground" />
                </motion.button>
              </div>
              <textarea
                value={avoidReason}
                onChange={e => setAvoidReason(e.target.value)}
                placeholder="Raison honnête..."
                maxLength={200}
                rows={3}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSetAvoided}
                disabled={avoidReason.trim().length === 0}
                className={`w-full py-3 rounded-xl text-sm font-bold ${
                  avoidReason.trim().length > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Confirmer
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ===== CREATE/EDIT TASK MODAL =====
const TaskFormModal = ({ open, onClose, defaultDay, task }: { open: boolean; onClose: () => void; defaultDay: string; task?: Task | null }) => {
  const { addTask, updateTask, settings, tasks } = useAppStore();
  const isEdit = !!task;

  const [name, setName] = useState('');
  const [day, setDay] = useState<Date | undefined>(new Date(defaultDay));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [strict, setStrict] = useState(false);

  const calcDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const duration = calcDuration(startTime, endTime);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDay(new Date(task.day));
      setStartTime(task.startTime || '');
      setEndTime(task.endTime || '');
      setCategory(task.category);
      setStrict(task.strict);
    } else {
      setName(''); setDay(new Date(defaultDay)); setStartTime(''); setEndTime(''); setCategory(CATEGORIES[0]); setStrict(false);
    }
  }, [task, open, defaultDay]);

  const dayStr = day ? format(day, 'yyyy-MM-dd') : '';
  const dayTasks = tasks.filter(t => t.day === dayStr && (!isEdit || t.id !== task?.id));
  const dayTaskCount = dayTasks.length;
  const atLimit = dayTaskCount >= settings.maxTasksPerDay;

  // Conflict detection
  const conflictingTasks = startTime && endTime && duration > 0
    ? dayTasks.filter(t => {
        if (!t.startTime || !t.endTime) return false;
        const [tsh, tsm] = t.startTime.split(':').map(Number);
        const [teh, tem] = t.endTime.split(':').map(Number);
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const tStart = tsh * 60 + tsm;
        const tEnd = teh * 60 + tem;
        const myStart = sh * 60 + sm;
        const myEnd = eh * 60 + em;
        return myStart < tEnd && myEnd > tStart;
      })
    : [];
  const hasConflict = conflictingTasks.length > 0;
  const [forceConflict, setForceConflict] = useState(false);

  // Reset force when times change
  useEffect(() => { setForceConflict(false); }, [startTime, endTime, day]);

  const canSubmit = name.trim().length > 0 && startTime.length > 0 && endTime.length > 0 && duration > 0 && (!atLimit || isEdit) && (!hasConflict || forceConflict);

  const handleSubmit = () => {
    if (!canSubmit || !day) return;
    const data = {
      name: name.trim(),
      day: format(day, 'yyyy-MM-dd'),
      duration,
      startTime,
      endTime,
      category,
      strict,
    };
    if (isEdit && task) {
      updateTask(task.id, data);
    } else {
      addTask(data);
    }
    setName(''); setStartTime(''); setEndTime(''); setStrict(false);
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

            {atLimit && !isEdit && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle size={14} className="text-destructive" />
                <span className="text-xs text-destructive">Limite de {settings.maxTasksPerDay} tâches atteinte pour ce jour.</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Nom *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nom de la tâche"
                maxLength={100}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Day picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Jour *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full justify-start text-left font-normal bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm flex items-center gap-2",
                    !day && "text-muted-foreground"
                  )}>
                    <CalendarIcon size={14} className="text-primary" />
                    {day ? format(day, "PPP", { locale: fr }) : "Choisir un jour"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={day} onSelect={setDay} initialFocus className={cn("p-3")} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start & End time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Début *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Fin *</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>
            {duration > 0 && (
              <p className="text-[10px] text-muted-foreground">Durée calculée : <span className="font-bold text-foreground">{Math.floor(duration / 60)}h{(duration % 60).toString().padStart(2, '0')}</span></p>
            )}
            {startTime && endTime && duration <= 0 && (
              <p className="text-[10px] text-destructive font-bold">L'heure de fin doit être après l'heure de début</p>
            )}
            {hasConflict && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
                  <AlertTriangle size={14} className="text-warning shrink-0" />
                  <div>
                    <p className="text-xs text-warning font-bold">Conflit horaire détecté</p>
                    <p className="text-[10px] text-warning/80">
                      Chevauche : {conflictingTasks.map(t => `${t.name} (${t.startTime}–${t.endTime})`).join(', ')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setForceConflict(!forceConflict)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    forceConflict ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/50 border border-border'
                  }`}
                >
                  <span className="text-xs text-foreground">Forcer malgré le conflit</span>
                  <span className={`text-xs font-bold ${forceConflict ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {forceConflict ? 'OUI' : 'NON'}
                  </span>
                </motion.button>
              </div>
            )}

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
                      category === cat
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
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
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                strict ? 'bg-warning/10 border border-warning/30' : 'bg-muted/50 border border-border'
              }`}
            >
              <span className="text-sm text-foreground">Tâche stricte</span>
              <span className={`text-xs font-bold ${strict ? 'text-warning' : 'text-muted-foreground'}`}>
                {strict ? 'OUI' : 'NON'}
              </span>
            </motion.button>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                canSubmit ? 'gradient-primary text-white shadow-lg glow-primary' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isEdit ? 'Enregistrer' : 'Créer la tâche'}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
