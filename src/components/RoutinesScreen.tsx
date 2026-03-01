import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Flame, Sun, Moon, Dumbbell, Brain, Sparkles, Plus, Trash2, Bell, BellOff, Eye, EyeOff, X, Edit3, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Routine } from '@/types/app';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const categoryConfig = {
  matin: { label: 'Matin', icon: Sun, color: 'text-warning', bg: 'bg-warning/10' },
  soir: { label: 'Soir', icon: Moon, color: 'text-accent', bg: 'bg-accent/10' },
  corps: { label: 'Corps', icon: Dumbbell, color: 'text-success', bg: 'bg-success/10' },
  esprit: { label: 'Esprit', icon: Brain, color: 'text-primary', bg: 'bg-primary/10' },
  spirituel: { label: 'Spirituel', icon: Sparkles, color: 'text-accent', bg: 'bg-accent/10' },
};

const categories = ['matin', 'corps', 'esprit', 'spirituel', 'soir'] as const;

export const RoutinesScreen = () => {
  const { routines, toggleRoutine, deleteRoutine, toggleRoutineActive, toggleRoutineReminder } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeRoutines = routines.filter(r => r.active);
  const completed = activeRoutines.filter(r => r.completed).length;
  const constanceRate = activeRoutines.length > 0 ? Math.round((completed / activeRoutines.length) * 100) : 0;
  const totalStreak = activeRoutines.reduce((a, r) => a + r.streak, 0);
  const avgStreak = activeRoutines.length > 0 ? Math.round(totalStreak / activeRoutines.length) : 0;

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Routines</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completed}/{activeRoutines.length} validées · {routines.length} total
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary"
          >
            <Plus size={20} />
          </button>
        </motion.div>

        {/* Constance stats */}
        <motion.div variants={item} className="glass-card-elevated p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground/80">Constance</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-foreground">{constanceRate}%</p>
              <p className="text-[10px] text-muted-foreground">Taux du jour</p>
              <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${constanceRate >= 80 ? 'bg-success' : constanceRate >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${constanceRate}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-warning">{avgStreak}</p>
              <p className="text-[10px] text-muted-foreground">Streak moyen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-accent">{Math.max(...activeRoutines.map(r => r.streak), 0)}</p>
              <p className="text-[10px] text-muted-foreground">Meilleur streak</p>
            </div>
          </div>
        </motion.div>

        {/* Streak overview */}
        <motion.div variants={item} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-warning" />
            <span className="text-xs font-semibold text-foreground/80">Streaks actifs</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {activeRoutines.filter(r => r.streak > 0).sort((a, b) => b.streak - a.streak).map(r => (
              <div key={r.id} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <span className="text-sm font-bold font-mono text-warning">{r.streak}</span>
                </div>
                <span className="text-[9px] text-muted-foreground text-center max-w-[56px] truncate">{r.name.split('—')[0].trim()}</span>
              </div>
            ))}
            {activeRoutines.filter(r => r.streak > 0).length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun streak actif</p>
            )}
          </div>
        </motion.div>

        {/* Grouped by category */}
        {categories.map(cat => {
          const catRoutines = routines.filter(r => r.category === cat);
          if (catRoutines.length === 0) return null;
          const cfg = categoryConfig[cat];
          const CatIcon = cfg.icon;
          const catCompleted = catRoutines.filter(r => r.completed && r.active).length;
          const catActive = catRoutines.filter(r => r.active).length;

          return (
            <motion.div key={cat} variants={item}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CatIcon size={14} className={cfg.color} />
                  <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">{cfg.label}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{catCompleted}/{catActive}</span>
              </div>
              <div className="space-y-2">
                {catRoutines.map(routine => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    expanded={expandedId === routine.id}
                    onToggleExpand={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
                    onEdit={() => setEditRoutine(routine)}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}

        {routines.length === 0 && (
          <motion.div variants={item} className="glass-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune routine. Crée ta première routine.</p>
          </motion.div>
        )}
      </motion.div>

      <RoutineFormModal
        open={showCreateModal || !!editRoutine}
        onClose={() => { setShowCreateModal(false); setEditRoutine(null); }}
        routine={editRoutine}
      />
    </>
  );
};

// ===== ROUTINE CARD =====
const RoutineCard = ({
  routine, expanded, onToggleExpand, onEdit
}: {
  routine: Routine; expanded: boolean; onToggleExpand: () => void; onEdit: () => void;
}) => {
  const { toggleRoutine, deleteRoutine, toggleRoutineActive, toggleRoutineReminder } = useAppStore();
  const cfg = categoryConfig[routine.category];

  return (
    <div className={`glass-card p-3.5 space-y-2 ${!routine.active ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <button onClick={() => routine.active && toggleRoutine(routine.id)} disabled={!routine.active}>
          {routine.completed && routine.active ? (
            <CheckCircle2 size={18} className="text-success shrink-0" />
          ) : (
            <Circle size={18} className="text-muted-foreground shrink-0" />
          )}
        </button>
        <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-medium ${routine.completed && routine.active ? 'line-through text-muted-foreground' : !routine.active ? 'text-muted-foreground' : 'text-foreground'}`}>
            {routine.name}
          </p>
          <div className="flex gap-1.5 mt-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{routine.frequency}</span>
            {routine.reminder && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">🔔</span>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1 text-xs text-accent shrink-0">
          <Flame size={12} />
          <span className="font-mono">{routine.streak}j</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2 border-t border-border/50 overflow-hidden"
          >
            {/* Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/70">Active</span>
              <button
                onClick={() => toggleRoutineActive(routine.id)}
                className="flex items-center gap-1.5 text-xs"
              >
                {routine.active ? (
                  <><Eye size={14} className="text-primary" /><span className="text-primary">Oui</span></>
                ) : (
                  <><EyeOff size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Non</span></>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/70">Rappel discret</span>
              <button
                onClick={() => toggleRoutineReminder(routine.id)}
                className="flex items-center gap-1.5 text-xs"
              >
                {routine.reminder ? (
                  <><Bell size={14} className="text-primary" /><span className="text-primary">Activé</span></>
                ) : (
                  <><BellOff size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Désactivé</span></>
                )}
              </button>
            </div>

            {/* Streak visual */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Constance (streak)</span>
                <span className="font-mono text-warning">{routine.streak} jours</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-sm ${
                      i < Math.min(routine.streak, 7) ? 'bg-warning/60' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground">7 derniers jours (visuel)</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-muted text-foreground text-[10px] font-medium"
              >
                <Edit3 size={12} /> Modifier
              </button>
              <button
                onClick={() => deleteRoutine(routine.id)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-[10px] font-medium"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== ROUTINE FORM MODAL =====
const RoutineFormModal = ({ open, onClose, routine }: { open: boolean; onClose: () => void; routine?: Routine | null }) => {
  const { addRoutine, updateRoutine } = useAppStore();
  const isEdit = !!routine;

  const [name, setName] = useState(routine?.name ?? '');
  const [category, setCategory] = useState<Routine['category']>(routine?.category ?? 'matin');
  const [frequency, setFrequency] = useState<Routine['frequency']>(routine?.frequency ?? 'quotidien');
  const [reminder, setReminder] = useState(routine?.reminder ?? false);

  // Reset form when routine changes
  useState(() => {
    if (routine) {
      setName(routine.name);
      setCategory(routine.category);
      setFrequency(routine.frequency);
      setReminder(routine.reminder ?? false);
    } else {
      setName('');
      setCategory('matin');
      setFrequency('quotidien');
      setReminder(false);
    }
  });

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isEdit && routine) {
      updateRoutine(routine.id, {
        name: name.trim(),
        category,
        frequency,
        reminder,
      });
    } else {
      addRoutine({
        name: name.trim(),
        category,
        frequency,
        active: true,
        reminder,
      });
    }
    setName('');
    setCategory('matin');
    setFrequency('quotidien');
    setReminder(false);
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
              <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Modifier la routine' : 'Nouvelle routine'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
                <X size={16} />
              </button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Nom *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Méditation — 15 min"
                maxLength={80}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Catégorie</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => {
                  const cfg = categoryConfig[cat];
                  const CatIcon = cfg.icon;
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
                        active ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <CatIcon size={16} />
                      <span className="text-[10px] font-medium">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Fréquence</label>
              <div className="flex gap-2">
                {(['quotidien', 'hebdomadaire'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      frequency === f ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Rappel discret</p>
                <p className="text-[10px] text-muted-foreground">Notification de rappel</p>
              </div>
              <button
                onClick={() => setReminder(!reminder)}
                className={`w-12 h-7 rounded-full transition-colors relative ${reminder ? 'bg-primary' : 'bg-muted'}`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-foreground absolute top-1"
                  animate={{ left: reminder ? 26 : 4 }}
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
              {isEdit ? 'Enregistrer' : 'Créer la routine'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
