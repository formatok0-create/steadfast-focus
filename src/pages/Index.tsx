import { BottomNav } from '@/components/BottomNav';
import { DashboardScreen } from '@/components/DashboardScreen';
import { ProjectsScreen } from '@/components/ProjectsScreen';
import { TasksScreen } from '@/components/TasksScreen';
import { SkillsScreen } from '@/components/SkillsScreen';
import { PlanningScreen } from '@/components/PlanningScreen';
import { RoutinesScreen } from '@/components/RoutinesScreen';
import { FormationsScreen } from '@/components/FormationsScreen';
import { ObjectivesScreen } from '@/components/ObjectivesScreen';
import { StatsScreen } from '@/components/StatsScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { DailyReviewScreen } from '@/components/DailyReviewScreen';
import { useAppStore } from '@/stores/appStore';
import { useNotifications } from '@/hooks/useNotifications';
import { AnimatePresence, motion } from 'framer-motion';

const screens: Record<string, React.FC> = {
  dashboard: DashboardScreen,
  projects: ProjectsScreen,
  tasks: TasksScreen,
  skills: SkillsScreen,
  planning: PlanningScreen,
  routines: RoutinesScreen,
  formations: FormationsScreen,
  objectives: ObjectivesScreen,
  stats: StatsScreen,
  settings: SettingsScreen,
  review: DailyReviewScreen,
};

const Index = () => {
  const { activeTab, settings } = useAppStore();
  useNotifications();
  const Screen = screens[activeTab] || DashboardScreen;

  return (
    <div data-theme={settings.theme} className="min-h-screen bg-background max-w-md mx-auto relative flex flex-col">
      <div className="safe-area-top pt-4" />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex-1 overflow-y-auto min-h-0"
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default Index;
