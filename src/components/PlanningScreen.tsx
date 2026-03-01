import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, Clock, CheckCircle2, Circle, ChevronLeft, ChevronRight, Flame, BookOpen, FolderOpen, ListTodo, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

interface TimeBlock {
  id: string;
  label: string;
  startHour: number;
  durationMin: number;
  type: 'task' | 'routine' | 'formation';
  completed: boolean;
  category?: string;
}

const typeStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  task: { bg: 'bg-primary/12', border: 'border-primary/25', text: 'text-primary', glow: 'shadow-primary/5' },
  routine: { bg: 'bg-accent/12', border: 'border-accent/25', text: 'text-accent', glow: 'shadow-accent/5' },
  formation: { bg: 'bg-success/12', border: 'border-success/25', text: 'text-success', glow: 'shadow-success/5' },
};

const hours = Array.from({ length: 24 }, (_, i) => i); // 0h to 23h

export const PlanningScreen = () => {
  const { tasks, routines, formations } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');

  // Build time blocks from real data
  const timeBlocks = useMemo(() => {
    const blocks: TimeBlock[] = [];

    // Tasks for selected day
    const dayTasks = tasks.filter(t => t.day === selectedDayStr);
    let nextTaskHour = 8;
    dayTasks.forEach(t => {
      let startHour: number;
      let endHour: number;
      if (t.startTime) {
        const [h, m] = t.startTime.split(':').map(Number);
        startHour = h + m / 60;
      } else {
        startHour = nextTaskHour;
      }
      if (t.endTime) {
        const [h, m] = t.endTime.split(':').map(Number);
        endHour = h + m / 60;
      } else {
        endHour = startHour + t.duration / 60;
      }
      const durationMin = Math.round((endHour - startHour) * 60);
      blocks.push({
        id: `task-${t.id}`,
        label: t.name,
        startHour,
        durationMin: durationMin > 0 ? durationMin : t.duration,
        type: 'task',
        completed: t.completed,
        category: t.category,
      });
      nextTaskHour = endHour;
    });

    // Active routines - place at fixed times
    const routineSlots: Record<string, number> = {
      matin: 6.5,
      corps: 14,
      soir: 20,
      esprit: 18,
      spirituel: 6,
    };
    const activeRoutines = routines.filter(r => r.active);
    activeRoutines.forEach(r => {
      const startH = routineSlots[r.category] ?? 7;
      blocks.push({
        id: `routine-${r.id}`,
        label: r.name,
        startHour: startH,
        durationMin: 30,
        type: 'routine',
        completed: r.completed,
        category: r.category,
      });
    });

    // Formation sessions for today
    formations.forEach(f => {
      f.modules.forEach(m => {
        m.sessions.forEach(s => {
          if (s.day === selectedDayStr) {
            blocks.push({
              id: `formation-${s.id}`,
              label: `${f.name} — ${s.name}`,
              startHour: 11,
              durationMin: s.duration,
              type: 'formation',
              completed: s.completed,
            });
          }
        });
      });
    });

    return blocks.sort((a, b) => a.startHour - b.startHour);
  }, [tasks, routines, formations, selectedDayStr]);

  // Detect conflicts between blocks
  const conflicts = useMemo(() => {
    const found: Set<string> = new Set();
    for (let i = 0; i < timeBlocks.length; i++) {
      for (let j = i + 1; j < timeBlocks.length; j++) {
        const a = timeBlocks[i], b = timeBlocks[j];
        const aEnd = a.startHour + a.durationMin / 60;
        const bEnd = b.startHour + b.durationMin / 60;
        if (a.startHour < bEnd && b.startHour < aEnd) {
          found.add(a.id);
          found.add(b.id);
        }
      }
    }
    return found;
  }, [timeBlocks]);

  const goDay = (offset: number) => setSelectedDate(d => addDays(d, offset));

  const dayStats = {
    total: timeBlocks.length,
    completed: timeBlocks.filter(b => b.completed).length,
    totalMin: timeBlocks.reduce((a, b) => a + b.durationMin, 0),
    tasks: timeBlocks.filter(b => b.type === 'task').length,
    routines: timeBlocks.filter(b => b.type === 'routine').length,
    formations: timeBlocks.filter(b => b.type === 'formation').length,
    conflicts: conflicts.size,
  };

  const formatBlockTime = (startHour: number, durationMin: number) => {
    const startH = Math.floor(startHour);
    const startM = Math.round((startHour - startH) * 60);
    const endTotal = startHour * 60 + durationMin;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;
    return `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')} — ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Planning<span className="text-gradient">.</span></h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goDay(-1)}
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
            onClick={() => goDay(1)}
            className="w-9 h-9 rounded-xl glass-card-bright flex items-center justify-center text-muted-foreground"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Week selector */}
      <motion.div variants={item} className="flex gap-2">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const dayNum = format(day, 'd');

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelectedDate(day)}
              className={`flex-1 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                isSelected
                  ? 'glass-card-elevated border border-primary/30 shadow-lg shadow-primary/10'
                  : isToday
                  ? 'glass-card-bright border border-accent/20'
                  : 'bg-muted/30'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                {dayLabels[i]}
              </span>
              <span className={`text-sm font-mono font-black ${isSelected ? 'text-primary' : isToday ? 'text-accent' : 'text-foreground'}`}>
                {dayNum}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="day-indicator"
                  className="absolute -bottom-0.5 w-5 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Day stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="stat-card stat-card-blue text-center">
          <ListTodo size={16} className="mx-auto mb-1.5 text-primary" />
          <p className="text-xl font-black text-foreground">{dayStats.tasks}</p>
          <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Tâches</p>
        </div>
        <div className="stat-card stat-card-violet text-center">
          <Flame size={16} className="mx-auto mb-1.5 text-accent" />
          <p className="text-xl font-black text-foreground">{dayStats.routines}</p>
          <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Routines</p>
        </div>
        <div className="stat-card stat-card-green text-center">
          <BookOpen size={16} className="mx-auto mb-1.5 text-success" />
          <p className="text-xl font-black text-foreground">{dayStats.formations}</p>
          <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Formations</p>
        </div>
      </motion.div>

      {/* Conflict warning */}
      {dayStats.conflicts > 0 && (
        <motion.div variants={item} className="flex items-center gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/20">
          <AlertTriangle size={18} className="text-warning shrink-0" />
          <div>
            <p className="text-sm font-bold text-warning">Conflit horaire</p>
            <p className="text-[10px] text-warning/80">{dayStats.conflicts} bloc{dayStats.conflicts > 1 ? 's' : ''} se chevauchent sur cette journée</p>
          </div>
        </motion.div>
      )}

      {dayStats.total > 0 && (
        <motion.div variants={item} className="glass-card-elevated p-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 gradient-cool blur-3xl" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg gradient-cool flex items-center justify-center">
                <CheckCircle2 size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-foreground/80">Avancement</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {dayStats.completed}/{dayStats.total} · {Math.round(dayStats.totalMin / 60 * 10) / 10}h prévues
            </span>
          </div>
          <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-fresh rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dayStats.total > 0 ? (dayStats.completed / dayStats.total) * 100 : 0}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div variants={item} className="glass-card-elevated p-4 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-5 gradient-primary blur-3xl" />

        {hours.map((hour) => {
          const hourBlocks = timeBlocks.filter(b => Math.floor(b.startHour) === hour);
          const hasContent = hourBlocks.length > 0;

          return (
            <div key={hour} className="flex gap-3 min-h-[52px]">
              {/* Time label */}
              <div className="w-11 shrink-0 text-right pt-1">
                <span className={`text-xs font-mono font-bold ${hasContent ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>

              {/* Timeline line + content */}
              <div className="flex-1 border-l border-border/20 pl-3 pb-1 relative">
                {/* Dot on the timeline */}
                {hasContent && (
                  <div className="absolute -left-[3.5px] top-2 w-[7px] h-[7px] rounded-full bg-primary/60 ring-2 ring-background" />
                )}

                {hourBlocks.map((block) => {
                  const style = typeStyles[block.type];
                  const heightPx = Math.max(block.durationMin * 0.8, 44);
                  const isConflict = conflicts.has(block.id);

                  return (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, x: -12, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      whileHover={{ scale: 1.02, x: 2 }}
                      className={`${isConflict ? 'bg-warning/12 border-warning/40' : `${style.bg} border ${style.border}`} border rounded-xl px-3.5 py-2.5 mb-2 shadow-lg ${style.glow} relative overflow-hidden`}
                      style={{ minHeight: `${heightPx}px` }}
                    >
                      {/* Conflict indicator */}
                      {isConflict && (
                        <div className="absolute top-2 right-2 z-20">
                          <AlertTriangle size={14} className="text-warning" />
                        </div>
                      )}

                      {/* Completed overlay */}
                      {block.completed && (
                        <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] flex items-center justify-center">
                          <CheckCircle2 size={20} className="text-success/60" />
                        </div>
                      )}

                      <div className="relative z-10">
                        <p className={`text-sm font-semibold ${isConflict ? 'text-warning' : style.text} ${block.completed ? 'line-through opacity-60' : ''}`}>
                          {block.label}
                        </p>
                        <span className={`text-[10px] font-mono ${isConflict ? 'text-warning/70' : `${style.text} opacity-60`} mt-0.5 block`}>
                          {formatBlockTime(block.startHour, block.durationMin)}
                        </span>
                      </div>

                      {/* Type indicator */}
                      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
                        block.type === 'task' ? 'bg-primary' :
                        block.type === 'routine' ? 'bg-accent' :
                        'bg-success'
                      }`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Empty state */}
      {timeBlocks.length === 0 && (
        <motion.div variants={item} className="glass-card-bright p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 gradient-primary" />
          <CalendarIcon size={40} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucune activité prévue ce jour</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Ajoute des tâches ou active des routines</p>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div variants={item} className="flex items-center justify-center gap-4 py-2">
        {[
          { label: 'Tâches', color: 'bg-primary' },
          { label: 'Routines', color: 'bg-accent' },
          { label: 'Formations', color: 'bg-success' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="text-[10px] text-muted-foreground font-medium">{l.label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
