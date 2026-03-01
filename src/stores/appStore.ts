import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Project, Routine, Skill } from '@/types/app';

interface AppState {
  tasks: Task[];
  projects: Project[];
  routines: Routine[];
  skills: Skill[];
  activeTab: string;
  quote: string;
  setActiveTab: (tab: string) => void;
  toggleRoutine: (id: string) => void;
  toggleTask: (id: string) => void;
}

const MOCK_ROUTINES: Routine[] = [
  { id: '1', name: 'Prière / Méditation', category: 'matin', frequency: 'quotidien', completed: false, streak: 12 },
  { id: '2', name: 'Lecture — 20 min', category: 'matin', frequency: 'quotidien', completed: true, streak: 8 },
  { id: '3', name: 'Sport — 45 min', category: 'corps', frequency: 'quotidien', completed: false, streak: 5 },
  { id: '4', name: 'Journaling', category: 'soir', frequency: 'quotidien', completed: false, streak: 3 },
  { id: '5', name: 'Revue de journée', category: 'soir', frequency: 'quotidien', completed: false, streak: 15 },
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

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: MOCK_TASKS,
      projects: MOCK_PROJECTS,
      routines: MOCK_ROUTINES,
      skills: MOCK_SKILLS,
      activeTab: 'dashboard',
      quote: "La discipline est le pont entre les objectifs et l'accomplissement.",
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleRoutine: (id) => set((s) => ({
        routines: s.routines.map(r => r.id === id ? { ...r, completed: !r.completed } : r)
      })),
      toggleTask: (id) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
    }),
    { name: 'discipline-app' }
  )
);
