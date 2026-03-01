import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Project, Routine, Skill, Formation, MonthlyObjective, AppSettings, DailyReview } from '@/types/app';

interface AppState {
  tasks: Task[];
  projects: Project[];
  routines: Routine[];
  skills: Skill[];
  formations: Formation[];
  objectives: MonthlyObjective[];
  settings: AppSettings;
  dailyReviews: DailyReview[];
  activeTab: string;
  quote: string;
  setActiveTab: (tab: string) => void;
  toggleRoutine: (id: string) => void;
  toggleTask: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
}

const MOCK_ROUTINES: Routine[] = [
  { id: '1', name: 'Prière / Méditation', category: 'matin', frequency: 'quotidien', completed: false, streak: 12, active: true },
  { id: '2', name: 'Lecture — 20 min', category: 'matin', frequency: 'quotidien', completed: true, streak: 8, active: true },
  { id: '3', name: 'Sport — 45 min', category: 'corps', frequency: 'quotidien', completed: false, streak: 5, active: true },
  { id: '4', name: 'Journaling', category: 'soir', frequency: 'quotidien', completed: false, streak: 3, active: true },
  { id: '5', name: 'Revue de journée', category: 'soir', frequency: 'quotidien', completed: false, streak: 15, active: true },
  { id: '6', name: 'Étirements', category: 'corps', frequency: 'quotidien', completed: false, streak: 2, active: true },
  { id: '7', name: 'Gratitude — 3 points', category: 'esprit', frequency: 'quotidien', completed: true, streak: 20, active: true },
  { id: '8', name: 'Lecture Coran', category: 'spirituel', frequency: 'quotidien', completed: false, streak: 30, active: true },
];

const MOCK_TASKS: Task[] = [
  { id: '1', name: 'Refactoring API module', day: '2026-03-01', duration: 90, realDuration: 0, category: 'Développement', projectId: '1', completed: false, strict: true, sessions: [] },
  { id: '2', name: 'Maquette écran profil', day: '2026-03-01', duration: 60, realDuration: 0, category: 'Design', projectId: '1', completed: false, strict: false, sessions: [] },
  { id: '3', name: 'Cours React avancé — Module 4', day: '2026-03-01', duration: 45, realDuration: 42, category: 'Formation', completed: true, strict: true, sessions: [] },
];

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'App Mobile Discipline', objective: 'MVP fonctionnel', priority: 'haute', startDate: '2026-02-01', endDate: '2026-04-30', estimatedTime: 120, realTime: 45, status: 'en_cours', tasks: [] },
  { id: '2', name: 'Portfolio Personnel', objective: 'Site en ligne', priority: 'moyenne', startDate: '2026-03-01', endDate: '2026-03-31', estimatedTime: 40, realTime: 8, status: 'en_cours', tasks: [] },
];

const MOCK_SKILLS: Skill[] = [
  { id: '1', name: 'React / TypeScript', objective: 'Maîtrise complète', level: 'intermédiaire', weeklyTarget: 10, realTime: 32, active: true },
  { id: '2', name: 'Design System', objective: 'Créer un DS complet', level: 'débutant', weeklyTarget: 5, realTime: 12, active: true },
];

const MOCK_FORMATIONS: Formation[] = [
  {
    id: '1',
    name: 'React Avancé — Patterns & Performance',
    skillId: '1',
    objective: 'Maîtriser les patterns avancés React',
    totalDuration: 20,
    planningMode: 'manuel',
    status: 'en_cours',
    modules: [
      {
        id: 'm1',
        name: 'Hooks avancés',
        sessions: [
          { id: 's1', name: 'useReducer & useContext', duration: 45, completed: true, realDuration: 42 },
          { id: 's2', name: 'Custom Hooks patterns', duration: 60, completed: true, realDuration: 55 },
          { id: 's3', name: 'useImperativeHandle', duration: 30, completed: false, realDuration: 0 },
        ],
      },
      {
        id: 'm2',
        name: 'Performance',
        sessions: [
          { id: 's4', name: 'React.memo & useMemo', duration: 45, completed: false, realDuration: 0 },
          { id: 's5', name: 'Code splitting & lazy', duration: 45, completed: false, realDuration: 0 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Design System — Fondamentaux',
    skillId: '2',
    objective: 'Construire un DS de A à Z',
    totalDuration: 12,
    planningMode: 'auto',
    status: 'en_cours',
    modules: [
      {
        id: 'm3',
        name: 'Tokens & Couleurs',
        sessions: [
          { id: 's6', name: 'Théorie des tokens', duration: 30, completed: true, realDuration: 28 },
          { id: 's7', name: 'Palette & contraste', duration: 45, completed: false, realDuration: 0 },
        ],
      },
    ],
  },
];

const MOCK_OBJECTIVES: MonthlyObjective[] = [
  {
    id: '1',
    month: '2026-03',
    main: 'Livrer le MVP de l\'app Discipline',
    secondary: ['Terminer le module React avancé', 'Maintenir 90% des routines'],
    habitToReinforce: 'Se lever à 5h30 chaque jour',
    behaviorToEliminate: 'Consulter les réseaux sociaux avant 12h',
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'sombre',
  maxTasksPerDay: 6,
  maxActiveSkills: 2,
  strictMode: false,
  notificationTone: 'calme',
  enabledSections: ['dashboard', 'projects', 'tasks', 'routines', 'skills', 'formations', 'planning', 'objectives', 'stats', 'settings'],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: MOCK_TASKS,
      projects: MOCK_PROJECTS,
      routines: MOCK_ROUTINES,
      skills: MOCK_SKILLS,
      formations: MOCK_FORMATIONS,
      objectives: MOCK_OBJECTIVES,
      settings: DEFAULT_SETTINGS,
      dailyReviews: [],
      activeTab: 'dashboard',
      quote: "La discipline est le pont entre les objectifs et l'accomplissement.",
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleRoutine: (id) => set((s) => ({
        routines: s.routines.map(r => r.id === id ? { ...r, completed: !r.completed } : r)
      })),
      toggleTask: (id) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      updateSettings: (newSettings) => set((s) => ({
        settings: { ...s.settings, ...newSettings }
      })),
    }),
    { name: 'discipline-app' }
  )
);
