import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Calendar, MoreHorizontal, X, FolderKanban, Target, BookOpen, BarChart3, Settings, Flame, Crosshair, Shield, Play, Pause, Square, Timer } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState, useEffect, useCallback } from 'react';

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

export const BottomNav = () => {
  const { activeTab, setActiveTab } = useAppStore();
  const [showMore, setShowMore] = useState(false);
  const [showChrono, setShowChrono] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

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
              onClick={() => setShowChrono(false)}
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

              <div className="text-center py-4">
                <p className={`text-5xl font-mono font-black tracking-tight ${running ? 'text-primary' : 'text-foreground'}`}>
                  {formatTime(elapsed)}
                </p>
                {running && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary mx-auto mt-3"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                {!running ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRunning(true)}
                    className="px-8 py-3 rounded-2xl gradient-cool text-white font-bold text-sm shadow-lg flex items-center gap-2"
                  >
                    <Play size={16} />
                    {elapsed > 0 ? 'Reprendre' : 'Démarrer'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRunning(false)}
                    className="px-8 py-3 rounded-2xl bg-warning/15 text-warning font-bold text-sm flex items-center gap-2"
                  >
                    <Pause size={16} />
                    Pause
                  </motion.button>
                )}
                {(elapsed > 0 || running) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setRunning(false); setElapsed(0); }}
                    className="px-6 py-3 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm flex items-center gap-2"
                  >
                    <Square size={16} />
                    Reset
                  </motion.button>
                )}
              </div>
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
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full glass-card-elevated border border-primary/30 flex items-center gap-2 shadow-lg"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-mono font-bold text-primary">{formatTime(elapsed)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="mx-4 mb-3 glass-card-elevated px-3 py-2.5 flex items-center justify-around">
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
                    className="absolute inset-0 gradient-primary rounded-2xl opacity-15"
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