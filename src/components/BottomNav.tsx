import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Calendar, MoreHorizontal, X, FolderKanban, Target, BookOpen, BarChart3, Settings, Flame, Crosshair } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';

const mainTabs = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { id: 'tasks', icon: CheckSquare, label: 'Tâches' },
  { id: 'planning', icon: Calendar, label: 'Planning' },
  { id: 'routines', icon: Flame, label: 'Routines' },
  { id: 'more', icon: MoreHorizontal, label: 'Plus' },
];

const moreItems = [
  { id: 'projects', icon: FolderKanban, label: 'Projets' },
  { id: 'skills', icon: Target, label: 'Compétences' },
  { id: 'formations', icon: BookOpen, label: 'Formations' },
  { id: 'objectives', icon: Crosshair, label: 'Objectifs' },
  { id: 'stats', icon: BarChart3, label: 'Statistiques' },
  { id: 'settings', icon: Settings, label: 'Paramètres' },
];

export const BottomNav = () => {
  const { activeTab, setActiveTab } = useAppStore();
  const [showMore, setShowMore] = useState(false);

  const handleTab = (id: string) => {
    if (id === 'more') {
      setShowMore(prev => !prev);
    } else {
      setActiveTab(id);
      setShowMore(false);
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="mx-4 mb-3 glass-card-elevated px-3 py-2.5 flex items-center justify-around">
          {mainTabs.map((tab) => {
            const isActive = tab.id === 'more' ? (showMore || isMoreActive) : activeTab === tab.id;
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
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground'}`}
                />
                <span className={`relative z-10 text-[10px] font-semibold transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
