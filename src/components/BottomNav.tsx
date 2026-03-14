import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Calendar, MoreHorizontal, X, FolderKanban, Target, BookOpen, BarChart3, Settings, Flame, Crosshair, Shield, Play, Pause, Square, Timer, ChevronDown, Link2, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import type { Task } from '@/types/app';

const mainTabs = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { id: 'tasks', icon: CheckSquare, label: 'Tâches' },
  { id: 'chrono', icon: Timer, label: 'Chrono' },
  { id: 'planning', icon: Calendar, label: 'Planning' },
  { id: 'more', icon: MoreHorizontal, label: 'Plus' },
];

const moreItems = [
  { id: 'routines', icon: Flame, label: 'Routines' },
  { id: 'projects', icon: FolderKanban, label: 'Projets' },
  { id: 'skills', icon: Target, label: 'Compétences' },
  { id: 'formations', icon: BookOpen, label: 'Formations' },
  { id: 'objectives', icon: Crosshair, label: 'Objectifs' },
  { id: 'review', icon: Shield, label: 'Revue' },
  { id: 'stats', icon: BarChart3, label: 'Statistiques' },
  { id: 'settings', icon: Settings, label: 'Paramètres' },
];

interface LinkedTask {
  type: 'daily' | 'project';
  taskId: string;
  projectId?: string;
  label: string;
}

export const BottomNav = () => {
  const { activeTab, setActiveTab, tasks, projects, addTaskTimerSession, addTimerSession } = useAppStore();
  const [showMore, setShowMore] = useState(false);
  const [showChrono, setShowChrono] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [linkedTask, setLinkedTask] = useState<LinkedTask | null>(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Available tasks to link
  const availableTasks = useMemo(() => {
    const list: LinkedTask[] = [];
    // Daily tasks (today, not completed)
    tasks.filter(t => t.day === today && !t.completed && t.status !== 'évitée').forEach(t => {
      list.push({ type: 'daily', taskId: t.id, label: t.name });
    });
    // Project tasks (not completed)
    projects.forEach(p => {
      p.tasks.filter(t => !t.completed).forEach(t => {
        list.push({ type: 'project', taskId: t.id, projectId: p.id, label: `${p.name} — ${t.name}` });
      });
    });
    return list;
  }, [tasks, projects, today]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = () => {
    setRunning(true);
    if (!sessionStart) setSessionStart(Date.now());
  };

  const handlePause = () => setRunning(false);

  const handleStop = () => {
    if (elapsed > 0 && sessionStart && linkedTask) {
      const durationMin = Math.max(1, Math.round(elapsed / 60));
      const session = {
        id: Math.random().toString(36).slice(2, 10),
        startTime: sessionStart,
        endTime: Date.now(),
        duration: durationMin,
      };
      if (linkedTask.type === 'daily') {
        addTaskTimerSession(linkedTask.taskId, session);
      } else if (linkedTask.type === 'project' && linkedTask.projectId) {
        addTimerSession(linkedTask.projectId, linkedTask.taskId, session);
      }
    }
    setRunning(false);
    setElapsed(0);
    setSessionStart(null);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setSessionStart(null);
  };

  const handleTab = (id: string) => {
    if (id === 'more') {
      setShowMore(prev => !prev);
      setShowChrono(false);
    } else if (id === 'chrono') {
      setShowChrono(prev => !prev);
      setShowMore(false);
    } else {
      setActiveTab(id);
      setShowMore(false);
      setShowChrono(false);
    }
  };

  const isMoreActive = moreItems.some(m => m.id === activeTab);

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed bottom-24 left-4 right-4 z-50 glass-card-elevated p-4 grid grid-cols-3 gap-2"
            >
              {moreItems.map((mi, i) => {
                const active = activeTab === mi.id;
                return (
                  <motion.button
                    key={mi.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                    onClick={() => handleTab(mi.id)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-300 ${
                      active
                        ? 'gradient-primary text-white glow-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <mi.icon size={20} />
                    <span className="text-[10px] font-semibold">{mi.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chrono panel */}
      <AnimatePresence>
        {showChrono && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowChrono(false); setShowTaskPicker(false); }}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed bottom-24 left-4 right-4 z-50 glass-card-elevated p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl gradient-cool flex items-center justify-center">
                    <Timer size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Chronomètre</h3>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowChrono(false)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <X size={14} className="text-foreground" />
                </motion.button>
              </div>

              {/* Task linker */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                  <Link2 size={10} />
                  Lier à une tâche
                </label>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowTaskPicker(!showTaskPicker)}
                  disabled={running}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                    linkedTask
                      ? 'bg-primary/10 border border-primary/25 text-primary'
                      : 'bg-muted/50 border border-border text-muted-foreground'
                  } ${running ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="truncate text-left flex-1">
                    {linkedTask ? linkedTask.label : 'Aucune tâche liée (libre)'}
                  </span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${showTaskPicker ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showTaskPicker && !running && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 max-h-48 overflow-y-auto rounded-xl bg-muted/30 border border-border p-2">
                        {/* Free mode */}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setLinkedTask(null); setShowTaskPicker(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                            !linkedTask ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          ⏱ Chrono libre (sans tâche)
                        </motion.button>

                        {availableTasks.length > 0 && (
                          <div className="border-t border-border/50 my-1" />
                        )}

                        {availableTasks.map(t => (
                          <motion.button
                            key={`${t.type}-${t.taskId}`}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setLinkedTask(t); setShowTaskPicker(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                              linkedTask?.taskId === t.taskId && linkedTask?.type === t.type
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${t.type === 'daily' ? 'bg-primary' : 'bg-accent'}`} />
                            {t.label}
                          </motion.button>
                        ))}

                        {availableTasks.length === 0 && (
                          <p className="text-[10px] text-muted-foreground text-center py-2">Aucune tâche en cours</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Timer display */}
              <div className="text-center py-4">
                <p className={`text-5xl font-mono font-black tracking-tight ${running ? 'text-primary' : 'text-foreground'}`}>
                  {formatTime(elapsed)}
                </p>
                {linkedTask && (
                  <p className="text-[10px] text-primary/70 font-medium mt-2 truncate px-4">
                    ▸ {linkedTask.label}
                  </p>
                )}
                {running && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary mx-auto mt-2"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {!running ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="px-8 py-3 rounded-2xl gradient-cool text-white font-bold text-sm shadow-lg flex items-center gap-2"
                  >
                    <Play size={16} />
                    {elapsed > 0 ? 'Reprendre' : 'Démarrer'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePause}
                    className="px-8 py-3 rounded-2xl bg-warning/15 text-warning font-bold text-sm flex items-center gap-2"
                  >
                    <Pause size={16} />
                    Pause
                  </motion.button>
                )}
                {(elapsed > 0 || running) && (
                  <>
                    {linkedTask && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStop}
                        className="px-6 py-3 rounded-2xl bg-primary/15 text-primary font-bold text-sm flex items-center gap-2"
                      >
                        <Square size={16} />
                        Enregistrer
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="px-6 py-3 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm flex items-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Réinitialiser
                    </motion.button>
                  </>
                )}
              </div>

              {linkedTask && elapsed > 0 && (
                <p className="text-[10px] text-center text-muted-foreground">
                  Le temps sera enregistré sur la tâche à l'arrêt
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mini chrono indicator when running and panel closed */}
      <AnimatePresence>
        {running && !showChrono && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setShowChrono(true)}
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full glass-card-elevated border border-primary/30 flex items-center gap-2 shadow-lg max-w-[80%]"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-primary shrink-0"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-mono font-bold text-primary">{formatTime(elapsed)}</span>
            {linkedTask && (
              <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">· {linkedTask.label}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="mx-4 mb-3 widget-card px-2 py-2 flex items-center justify-around !rounded-[1.5rem]">
          {mainTabs.map((tab) => {
            const isActive = tab.id === 'more' ? (showMore || isMoreActive)
              : tab.id === 'chrono' ? showChrono
              : activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-2xl gradient-primary"
                    style={{ opacity: 0.18 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <tab.icon
                  size={20}
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'text-primary scale-110' : running && tab.id === 'chrono' ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span className={`relative z-10 text-[10px] font-semibold transition-all duration-300 ${isActive ? 'text-primary' : running && tab.id === 'chrono' ? 'text-primary' : 'text-muted-foreground'}`}>
                  {running && tab.id === 'chrono' ? formatTime(elapsed) : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};