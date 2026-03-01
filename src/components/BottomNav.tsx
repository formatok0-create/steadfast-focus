import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, CheckSquare, Target, Calendar } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const tabs = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { id: 'projects', icon: FolderKanban, label: 'Projets' },
  { id: 'tasks', icon: CheckSquare, label: 'Tâches' },
  { id: 'skills', icon: Target, label: 'Skills' },
  { id: 'planning', icon: Calendar, label: 'Planning' },
];

export const BottomNav = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="mx-3 mb-2 glass-card-elevated px-2 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/15 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon
                size={20}
                className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span className={`relative z-10 text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
