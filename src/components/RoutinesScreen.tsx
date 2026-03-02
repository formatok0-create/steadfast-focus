import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Flame, Sun, Moon, Dumbbell, Brain, Sparkles, Plus, Trash2, Bell, BellOff, Eye, EyeOff, X, Edit3, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Routine } from '@/types/app';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
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
  const bestStreak = Math.max(...activeRoutines.map(r => r.streak), 0);

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Routines<span className="text-gradient">.</span></h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completed}/{activeRoutines.length} validées · {routines.length} total
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateModal(true)}
            className="w-11 h-11 rounded-2xl gradient-warm flex items-center justify-center text-white shadow-lg"
          >
            <Plus size={20} />
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <div className="stat-card stat-card-green text-center">
            <TrendingUp size={18} className="mx-auto mb-2 text-success" />
            <p className="text-2xl font-black text-foreground">{constanceRate}%</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Constance</p>
          </div>
          <div className="stat-card stat-card-amber text-center">
            <Flame size={18} className="mx-auto mb-2 text-warning" />
            <p className="text-2xl font-black text-foreground">{avgStreak}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Streak moy.</p>
          </div>
          <div className="stat-card stat-card-violet text-center">
            <Zap size={18} className="mx-auto mb-2 text-accent" />
            <p className="text-2xl font-black text-foreground">{bestStreak}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Meilleur</p>
          </div>
        </motion.div>

        {/* Constance progress */}
        <motion.div variants={item} className="glass-card-elevated p-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 gradient-warm blur-3xl" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-foreground/80">Progression du jour</span>
          </div>
          <div className="h-2.5 bg-muted/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${constanceRate >= 80 ? 'gradient-fresh' : constanceRate >= 50 ? 'gradient-warm' : 'bg-destructive'}`}
              initial={{ width: 0 }}
              animate={{ width: `${constanceRate}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono text-right">{completed}/{activeRoutines.length} validées</p>
        </motion.div>

        {/* Streak overview */}
        <motion.div variants={item} className="glass-card-bright p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-warning" />
            <span className="text-xs font-bold text-foreground/80">Streaks actifs</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {activeRoutines.filter(r => r.streak > 0).sort((a, b) => b.streak - a.streak).map(r => (
              <motion.div
                key={r.id}
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className="w-11 h-11 rounded-2xl bg-warning/10 flex items-center justify-center border border-warning/20">
                  <span className="text-sm font-black font-mono text-warning">{r.streak}</span>
                </div>
                <span className="text-[9px] text-muted-foreground text-center max-w-[56px] truncate">{r.name.split('—')[0].trim()}</span>
              </motion.div>
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
                  <div className={`w-6 h-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                    <CatIcon size={12} className={cfg.color} />
                  </div>
                  <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider">{cfg.label}</span>
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
          <motion.div variants={item} className="glass-card-bright p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 gradient-warm" />
            <Flame size={40} className="mx-auto mb-3 text-muted-foreground" />
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cfg = categoryConfig[routine.category];

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`glass-card-bright p-4 space-y-2 ${!routine.active ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => routine.active && toggleRoutine(routine.id)} disabled={!routine.active}>
          {routine.completed && routine.active ? (
            <div className="w-6 h-6 rounded-full gradient-fresh flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary/60 transition-colors" />
          )}
        </motion.button>
        <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-semibold ${routine.completed && routine.active ? 'line-through text-muted-foreground' : !routine.active ? 'text-muted-foreground' : 'text-foreground'}`}>
            {routine.name}
          </p>
          <div className="flex gap-1.5 mt-1">
            <span className={`text-[9px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>{cfg.label}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{routine.frequency}</span>
            {routine.reminder && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">🔔</span>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 shrink-0">
          <Flame size={12} className="text-warning" />
          <span className="text-xs font-mono font-black text-warning">{routine.streak}j</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t border-border/50 overflow-hidden"
          >
            {/* Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/70 font-medium">Active</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleRoutineActive(routine.id)}
                className="flex items-center gap-1.5 text-xs"
              >
                {routine.active ? (
                  <><Eye size={14} className="text-primary" /><span className="text-primary font-semibold">Oui</span></>
                ) : (
                  <><EyeOff size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Non</span></>
                )}
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/70 font-medium">Rappel discret</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleRoutineReminder(routine.id)}
                className="flex items-center gap-1.5 text-xs"
              >
                {routine.reminder ? (
                  <><Bell size={14} className="text-primary" /><span className="text-primary font-semibold">Activé</span></>
                ) : (
                  <><BellOff size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Désactivé</span></>
                )}
              </motion.button>
            </div>

            {/* Streak visual */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="font-medium">Constance (streak)</span>
                <span className="font-mono font-bold text-warning">{routine.streak} jours</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex-1 h-3 rounded-sm ${
                      i < Math.min(routine.streak, 7) ? 'bg-warning/60' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground">7 derniers jours (visuel)</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-muted text-foreground text-[10px] font-semibold hover:bg-muted/80 transition-colors"
              >
                <Edit3 size={12} /> Modifier
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-[10px] font-semibold hover:bg-destructive/20 transition-colors"
              >
                <Trash2 size={12} />
              </motion.button>
            </div>

            <ConfirmDeleteModal
              open={confirmDelete}
              title="Supprimer cette routine ?"
              message="Le streak sera perdu définitivement."
              onConfirm={() => { deleteRoutine(routine.id); setConfirmDelete(false); }}
              onCancel={() => setConfirmDelete(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      updateRoutine(routine.id, { name: name.trim(), category, frequency, reminder });
    } else {
      addRoutine({ name: name.trim(), category, frequency, active: true, reminder });
    }
    setName(''); setCategory('matin'); setFrequency('quotidien'); setReminder(false);
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
            className="fixed inset-x-3 bottom-0 z-50 glass-card-elevated rounded-t-3xl overflow-y-auto p-5 pb-24 space-y-5 max-h-[85vh]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Modifier la routine' : 'Nouvelle routine'}</h2>
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
                placeholder="Ex: Méditation — 15 min"
                maxLength={80}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Catégorie</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => {
                  const cfg = categoryConfig[cat];
                  const CatIcon = cfg.icon;
                  const active = category === cat;
                  return (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                        active ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <CatIcon size={16} />
                      <span className="text-[10px] font-semibold">{cfg.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Fréquence</label>
              <div className="flex gap-2">
                {(['quotidien', 'hebdomadaire'] as const).map(f => (
                  <motion.button
                    key={f}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      frequency === f ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Reminder */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setReminder(!reminder)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                reminder ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50 border border-border'
              }`}
            >
              <div>
                <p className="text-sm text-foreground">Rappel discret</p>
                <p className="text-[10px] text-muted-foreground">Notification de rappel</p>
              </div>
              <div className={`text-xs font-bold ${reminder ? 'text-primary' : 'text-muted-foreground'}`}>
                {reminder ? '🔔 ON' : 'OFF'}
              </div>
            </motion.button>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                canSubmit ? 'gradient-warm text-white shadow-lg' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isEdit ? 'Enregistrer' : 'Créer la routine'}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
