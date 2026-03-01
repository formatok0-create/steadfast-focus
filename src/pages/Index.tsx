import { BottomNav } from '@/components/BottomNav';
import { DashboardScreen } from '@/components/DashboardScreen';
import { ProjectsScreen } from '@/components/ProjectsScreen';
import { TasksScreen } from '@/components/TasksScreen';
import { SkillsScreen } from '@/components/SkillsScreen';
import { PlanningScreen } from '@/components/PlanningScreen';
import { useAppStore } from '@/stores/appStore';
import { AnimatePresence, motion } from 'framer-motion';

const screens: Record<string, React.FC> = {
  dashboard: DashboardScreen,
  projects: ProjectsScreen,
  tasks: TasksScreen,
  skills: SkillsScreen,
  planning: PlanningScreen,
};

const Index = () => {
  const { activeTab } = useAppStore();
  const Screen = screens[activeTab] || DashboardScreen;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden">
      <div className="safe-area-top pt-4" />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="overflow-y-auto"
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default Index;
