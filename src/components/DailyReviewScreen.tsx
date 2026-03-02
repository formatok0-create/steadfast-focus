import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldAlert, Star, BookOpen, Trophy, TrendingUp, 
  ChevronLeft, ChevronRight, Save, X, Flame, CheckCircle2, 
  AlertTriangle, Calendar, MessageSquare, Lightbulb, Smile,
  Frown, Meh, Zap
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DailyReview } from '@/types/app';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const moodConfig = {
  excellent: { icon: Star, label: 'Excellent', color: 'text-success', bg: 'bg-success/15', border: 'border-success/30' },
  bon: { icon: Smile, label: 'Bon', color: 'text-primary', bg: 'bg-primary/15', border: 'border-primary/30' },
  moyen: { icon: Meh, label: 'Moyen', color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30' },
  difficile: { icon: Frown, label: 'Difficile', color: 'text-destructive', bg: 'bg-destructive/15', border: 'border-destructive/30' },
};

export const DailyReviewScreen = () => {
  const { tasks, routines, dailyReviews, addDailyReview, deleteDailyReview } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');

  // Calculate day stats
  const dayTasks = tasks.filter(t => t.day === selectedDayStr);
  const activeRoutines = routines.filter(r => r.active);
  const completedTasks = dayTasks.filter(t => t.completed).length;
  const completedRoutines = activeRoutines.filter(r => r.completed).length;
  const taskRate = dayTasks.length > 0 ? Math.round((completedTasks / dayTasks.length) * 100) : 0;
  const routineRate = activeRoutines.length > 0 ? Math.round((completedRoutines / activeRoutines.length) * 100) : 0;
  const isHonorable = taskRate >= 70 && routineRate >= 60;

  // Existing review for this day
  const existingReview = dailyReviews.find(r => r.day === selectedDayStr);

  // Form state
  const [notes, setNotes] = useState('');
  const [wins, setWins] = useState('');
  const [lesson, setLesson] = useState('');
  const [mood, setMood] = useState<DailyReview['mood']>('bon');

  const openForm = () => {
    if (existingReview) {
      setNotes(existingReview.notes);
      setWins(existingReview.wins);
      setLesson(existingReview.lesson);
      setMood(existingReview.mood);
    } else {
      setNotes('');
      setWins('');
      setLesson('');
      setMood('bon');
    }
    setShowForm(true);
  };

  const handleSave = () => {
    if (existingReview) {
      // Delete old and add new
      deleteDailyReview(existingReview.id);
    }
    addDailyReview({
      day: selectedDayStr,
      honorable: isHonorable,
      taskRate,
      routineRate,
      notes: notes.trim(),
      wins: wins.trim(),
      lesson: lesson.trim(),
      mood,
      completedAt: Date.now(),
    });
    setShowForm(false);
  };

  // History (last 14 days)
  const reviewHistory = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const review = dailyReviews.find(r => r.day === day);
      return { day, review };
    });
  }, [dailyReviews]);

  const honorableDays = dailyReviews.filter(r => r.honorable).length;
  const totalReviews = dailyReviews.length;
  const honorableRate = totalReviews > 0 ? Math.round((honorableDays / totalReviews) * 100) : 0;

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Revue<span className="text-gradient">.</span></h1>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedDate(d => subDays(d, 1))}
              className="w-9 h-9 rounded-xl glass-card-bright flex items-center justify-center text-muted-foreground"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/10"
            >
              Aujourd'hui
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedDate(d => addDays(d, 1))}
              className="w-9 h-9 rounded-xl glass-card-bright flex items-center justify-center text-muted-foreground"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* Honorable indicator */}
        <motion.div 
          variants={item} 
          className={`glass-card-elevated p-6 relative overflow-hidden ${isHonorable ? 'ring-1 ring-success/30' : 'ring-1 ring-destructive/20'}`}
        >
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-15 ${isHonorable ? 'bg-success' : 'bg-destructive'}`} />
          
          <div className="flex items-center gap-4 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isHonorable ? 'bg-success/15' : 'bg-destructive/15'}`}
            >
              {isHonorable ? (
                <Shield size={32} className="text-success" />
              ) : (
                <ShieldAlert size={32} className="text-destructive" />
              )}
            </motion.div>
            <div className="flex-1">
              <h2 className={`text-lg font-black ${isHonorable ? 'text-success' : 'text-destructive'}`}>
                {isHonorable ? 'Journée Honorable' : 'Journée Incomplète'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isHonorable 
                  ? 'Tu as respecté tes engagements.' 
                  : 'Les seuils ne sont pas atteints (70% tâches, 60% routines).'}
              </p>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-5 space-y-3 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground/80">Tâches</span>
                </div>
                <span className={`text-xs font-mono font-bold ${taskRate >= 70 ? 'text-success' : 'text-destructive'}`}>
                  {completedTasks}/{dayTasks.length} — {taskRate}%
                </span>
              </div>
              <div className="h-2.5 bg-muted/60 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${taskRate >= 70 ? 'gradient-fresh' : 'bg-destructive/60'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${taskRate}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-muted-foreground">Seuil : 70%</span>
                {taskRate >= 70 && <span className="text-[9px] text-success font-bold">✓ Atteint</span>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Flame size={12} className="text-accent" />
                  <span className="text-xs font-semibold text-foreground/80">Routines</span>
                </div>
                <span className={`text-xs font-mono font-bold ${routineRate >= 60 ? 'text-success' : 'text-destructive'}`}>
                  {completedRoutines}/{activeRoutines.length} — {routineRate}%
                </span>
              </div>
              <div className="h-2.5 bg-muted/60 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${routineRate >= 60 ? 'gradient-warm' : 'bg-destructive/60'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${routineRate}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-muted-foreground">Seuil : 60%</span>
                {routineRate >= 60 && <span className="text-[9px] text-success font-bold">✓ Atteint</span>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Existing review display or CTA */}
        {existingReview ? (
          <motion.div variants={item} className="glass-card-elevated p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <BookOpen size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-foreground/80">Bilan du jour</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${moodConfig[existingReview.mood].bg} ${moodConfig[existingReview.mood].border} border`}>
                {(() => { const M = moodConfig[existingReview.mood].icon; return <M size={12} className={moodConfig[existingReview.mood].color} />; })()}
                <span className={`text-[10px] font-bold ${moodConfig[existingReview.mood].color}`}>{moodConfig[existingReview.mood].label}</span>
              </div>
            </div>

            {existingReview.wins && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Trophy size={12} className="text-warning" />
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Victoires</span>
                </div>
                <p className="text-sm text-foreground">{existingReview.wins}</p>
              </div>
            )}

            {existingReview.notes && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-primary" />
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Notes</span>
                </div>
                <p className="text-sm text-muted-foreground">{existingReview.notes}</p>
              </div>
            )}

            {existingReview.lesson && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Lightbulb size={12} className="text-success" />
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Leçon</span>
                </div>
                <p className="text-sm text-foreground">{existingReview.lesson}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openForm}
              className="w-full py-2.5 rounded-xl bg-muted text-foreground text-xs font-semibold"
            >
              Modifier la revue
            </motion.button>
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openForm}
              className="w-full glass-card-elevated p-5 space-y-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                  <BookOpen size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Faire ma revue de journée</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Obligatoire pour valider ta performance</p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Stats overview */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <div className="stat-card stat-card-green text-center">
            <Shield size={16} className="mx-auto mb-1.5 text-success" />
            <p className="text-xl font-black text-foreground">{honorableDays}</p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Honorables</p>
          </div>
          <div className="stat-card stat-card-blue text-center">
            <Calendar size={16} className="mx-auto mb-1.5 text-primary" />
            <p className="text-xl font-black text-foreground">{totalReviews}</p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Revues</p>
          </div>
          <div className="stat-card stat-card-violet text-center">
            <Zap size={16} className="mx-auto mb-1.5 text-accent" />
            <p className="text-xl font-black text-foreground">{honorableRate}%</p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Taux</p>
          </div>
        </motion.div>

        {/* History - 14 days grid */}
        <motion.div variants={item} className="glass-card-elevated p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-cool flex items-center justify-center">
              <TrendingUp size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-foreground/80">Historique (14 jours)</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {reviewHistory.map(({ day, review }) => {
              const dayNum = day.split('-')[2];
              const isToday = day === format(new Date(), 'yyyy-MM-dd');
              const isSelected = day === selectedDayStr;

              return (
                <motion.button
                  key={day}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDate(new Date(day))}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  } ${
                    review
                      ? review.honorable
                        ? 'bg-success/15 border border-success/20'
                        : 'bg-destructive/15 border border-destructive/20'
                      : 'bg-muted/30'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold ${
                    review ? (review.honorable ? 'text-success' : 'text-destructive') : 'text-muted-foreground'
                  }`}>
                    {dayNum}
                  </span>
                  {review && (
                    <div className={`w-1.5 h-1.5 rounded-full ${review.honorable ? 'bg-success' : 'bg-destructive'}`} />
                  )}
                  {isToday && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-[9px] text-muted-foreground">Honorable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="text-[9px] text-muted-foreground">Incomplète</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-muted" />
              <span className="text-[9px] text-muted-foreground">Pas de revue</span>
            </div>
          </div>
        </motion.div>

        {/* Recent reviews list */}
        {dailyReviews.length > 0 && (
          <motion.div variants={item} className="space-y-2">
            <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider px-1">Dernières revues</span>
            {dailyReviews
              .sort((a, b) => b.completedAt - a.completedAt)
              .slice(0, 5)
              .map(review => {
                const moodCfg = moodConfig[review.mood];
                const MoodIcon = moodCfg.icon;
                return (
                  <motion.div
                    key={review.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedDate(new Date(review.day))}
                    className="glass-card-bright p-3.5 flex items-center gap-3 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${review.honorable ? 'bg-success/15' : 'bg-destructive/15'}`}>
                      {review.honorable ? <Shield size={18} className="text-success" /> : <ShieldAlert size={18} className="text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground capitalize">
                        {format(new Date(review.day), 'EEEE d MMM', { locale: fr })}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {review.wins || review.notes || 'Pas de notes'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${moodCfg.bg}`}>
                        <MoodIcon size={10} className={moodCfg.color} />
                        <span className={`text-[9px] font-bold ${moodCfg.color}`}>{moodCfg.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-muted-foreground">{review.taskRate}%</p>
                        <p className="text-[9px] text-muted-foreground/60">tâches</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </motion.div>

      {/* Review form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-elevated w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 pb-24 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Revue de journée</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowForm(false)}>
                  <X size={20} className="text-muted-foreground" />
                </motion.button>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-2 p-3 rounded-xl ${isHonorable ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                {isHonorable ? <Shield size={16} className="text-success" /> : <ShieldAlert size={16} className="text-destructive" />}
                <span className={`text-xs font-bold ${isHonorable ? 'text-success' : 'text-destructive'}`}>
                  {isHonorable ? 'Journée Honorable' : 'Journée Incomplète'} — Tâches {taskRate}% · Routines {routineRate}%
                </span>
              </div>

              {/* Mood */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Humeur</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(moodConfig) as Array<DailyReview['mood']>).map(m => {
                    const cfg = moodConfig[m];
                    const Icon = cfg.icon;
                    const selected = mood === m;
                    return (
                      <motion.button
                        key={m}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMood(m)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                          selected ? `${cfg.bg} ${cfg.border} border ring-1 ring-current/20` : 'bg-muted/30'
                        }`}
                      >
                        <Icon size={18} className={selected ? cfg.color : 'text-muted-foreground'} />
                        <span className={`text-[9px] font-bold ${selected ? cfg.color : 'text-muted-foreground'}`}>{cfg.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Wins */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-1">
                  <Trophy size={12} className="text-warning" /> Victoires du jour
                </label>
                <textarea
                  value={wins}
                  onChange={e => setWins(e.target.value)}
                  placeholder="Qu'as-tu accompli de bien aujourd'hui ?"
                  rows={2}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={12} className="text-primary" /> Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observations, blocages, réflexions..."
                  rows={2}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Lesson */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb size={12} className="text-success" /> Leçon du jour
                </label>
                <input
                  value={lesson}
                  onChange={e => setLesson(e.target.value)}
                  placeholder="Qu'as-tu appris ?"
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg glow-primary"
              >
                <Save size={16} />
                Enregistrer la revue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
