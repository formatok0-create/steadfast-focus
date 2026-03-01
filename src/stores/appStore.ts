import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Project, Routine, Skill, Formation, MonthlyObjective, AppSettings, DailyReview, TimerSession } from '@/types/app';

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
  updateSettings: (s: Partial<AppSettings>) => void;
  // Project CRUD
  addProject: (project: Omit<Project, 'id' | 'realTime' | 'tasks'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Project tasks
  addProjectTask: (projectId: string, task: Omit<Task, 'id' | 'realDuration' | 'completed' | 'sessions'>) => void;
  updateProjectTask: (projectId: string, taskId: string, data: Partial<Task>) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addTimerSession: (projectId: string, taskId: string, session: TimerSession) => void;
  updateProjectTaskRealDuration: (projectId: string, taskId: string, seconds: number) => void;
  // Skill CRUD
  addSkill: (skill: Omit<Skill, 'id' | 'realTime'>) => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  toggleSkillActive: (id: string) => void;
  // Routine CRUD
  addRoutine: (routine: Omit<Routine, 'id' | 'completed' | 'streak'>) => void;
  updateRoutine: (id: string, data: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutineActive: (id: string) => void;
  toggleRoutineReminder: (id: string) => void;
  // Daily tasks CRUD
  addTask: (task: Omit<Task, 'id' | 'realDuration' | 'completed' | 'sessions' | 'status'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: Task['status'], avoidReason?: string) => void;
  addTaskTimerSession: (taskId: string, session: TimerSession) => void;
  // Formation CRUD
  addFormation: (formation: Omit<Formation, 'id' | 'modules'>) => void;
  updateFormation: (id: string, data: Partial<Formation>) => void;
  deleteFormation: (id: string) => void;
  addFormationModule: (formationId: string, name: string) => void;
  updateFormationModule: (formationId: string, moduleId: string, name: string) => void;
  deleteFormationModule: (formationId: string, moduleId: string) => void;
  addFormationSession: (formationId: string, moduleId: string, session: { name: string; duration: number; day?: string }) => void;
  updateFormationSession: (formationId: string, moduleId: string, sessionId: string, data: Partial<import('@/types/app').FormationSession>) => void;
  deleteFormationSession: (formationId: string, moduleId: string, sessionId: string) => void;
  toggleFormationSession: (formationId: string, moduleId: string, sessionId: string) => void;
  addFormationSessionTime: (formationId: string, moduleId: string, sessionId: string, minutes: number) => void;
  // Objectives CRUD
  addObjective: (objective: Omit<MonthlyObjective, 'id'>) => void;
  updateObjective: (id: string, data: Partial<MonthlyObjective>) => void;
  deleteObjective: (id: string) => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);

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
  { id: '1', name: 'Refactoring API module', day: '2026-03-01', startTime: '08:00', duration: 90, realDuration: 0, category: 'Développement', projectId: '1', completed: false, strict: true, sessions: [] },
  { id: '2', name: 'Maquette écran profil', day: '2026-03-01', startTime: '09:30', duration: 60, realDuration: 0, category: 'Design', projectId: '1', completed: false, strict: false, sessions: [] },
  { id: '3', name: 'Cours React avancé — Module 4', day: '2026-03-01', startTime: '11:00', duration: 45, realDuration: 42, category: 'Formation', completed: true, strict: true, sessions: [
    { id: 'ts0', startTime: 1740800000000, endTime: 1740802520000, duration: 42 }
  ] },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: '1', name: 'App Mobile Discipline', objective: 'MVP fonctionnel', priority: 'haute',
    startDate: '2026-02-01', endDate: '2026-04-30', estimatedTime: 120, realTime: 45, status: 'en_cours',
    tasks: [
      { id: 'pt1', name: 'Architecture globale', day: '2026-02-15', duration: 120, realDuration: 110, category: 'Développement', projectId: '1', completed: true, strict: true, sessions: [
        { id: 'ts1', startTime: 1739600000000, endTime: 1739606600000, duration: 110 }
      ]},
      { id: 'pt2', name: 'Écran Dashboard', day: '2026-02-20', duration: 90, realDuration: 85, category: 'Développement', projectId: '1', completed: true, strict: false, sessions: [
        { id: 'ts2', startTime: 1740000000000, endTime: 1740005100000, duration: 85 }
      ]},
      { id: 'pt3', name: 'Système de navigation', day: '2026-03-01', duration: 60, realDuration: 0, category: 'Développement', projectId: '1', completed: false, strict: true, sessions: [] },
    ]
  },
  {
    id: '2', name: 'Portfolio Personnel', objective: 'Site en ligne', priority: 'moyenne',
    startDate: '2026-03-01', endDate: '2026-03-31', estimatedTime: 40, realTime: 8, status: 'en_cours',
    tasks: [
      { id: 'pt4', name: 'Maquette Figma', day: '2026-03-02', duration: 120, realDuration: 0, category: 'Design', projectId: '2', completed: false, strict: false, sessions: [] },
    ]
  },
];

const MOCK_SKILLS: Skill[] = [
  { id: '1', name: 'React / TypeScript', objective: 'Maîtrise complète', level: 'intermédiaire', weeklyTarget: 10, realTime: 32, active: true },
  { id: '2', name: 'Design System', objective: 'Créer un DS complet', level: 'débutant', weeklyTarget: 5, realTime: 12, active: true },
];

const MOCK_FORMATIONS: Formation[] = [
  {
    id: '1', name: 'React Avancé — Patterns & Performance', skillId: '1',
    objective: 'Maîtriser les patterns avancés React', totalDuration: 20, planningMode: 'manuel', status: 'en_cours',
    modules: [
      { id: 'm1', name: 'Hooks avancés', sessions: [
        { id: 's1', name: 'useReducer & useContext', duration: 45, completed: true, realDuration: 42 },
        { id: 's2', name: 'Custom Hooks patterns', duration: 60, completed: true, realDuration: 55 },
        { id: 's3', name: 'useImperativeHandle', duration: 30, completed: false, realDuration: 0 },
      ]},
      { id: 'm2', name: 'Performance', sessions: [
        { id: 's4', name: 'React.memo & useMemo', duration: 45, completed: false, realDuration: 0 },
        { id: 's5', name: 'Code splitting & lazy', duration: 45, completed: false, realDuration: 0 },
      ]},
    ],
  },
  {
    id: '2', name: 'Design System — Fondamentaux', skillId: '2',
    objective: 'Construire un DS de A à Z', totalDuration: 12, planningMode: 'auto', status: 'en_cours',
    modules: [
      { id: 'm3', name: 'Tokens & Couleurs', sessions: [
        { id: 's6', name: 'Théorie des tokens', duration: 30, completed: true, realDuration: 28 },
        { id: 's7', name: 'Palette & contraste', duration: 45, completed: false, realDuration: 0 },
      ]},
    ],
  },
];

const MOCK_OBJECTIVES: MonthlyObjective[] = [
  {
    id: '1', month: '2026-03',
    main: 'Livrer le MVP de l\'app Discipline',
    secondary: ['Terminer le module React avancé', 'Maintenir 90% des routines'],
    habitToReinforce: 'Se lever à 5h30 chaque jour',
    behaviorToEliminate: 'Consulter les réseaux sociaux avant 12h',
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'sombre', maxTasksPerDay: 6, maxActiveSkills: 2, strictMode: false,
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

      // Skill CRUD
      addSkill: (data) => set((s) => {
        const activeCount = s.skills.filter(sk => sk.active).length;
        if (data.active && activeCount >= s.settings.maxActiveSkills) {
          return s; // limit reached
        }
        return { skills: [...s.skills, { ...data, id: genId(), realTime: 0 }] };
      }),
      updateSkill: (id, data) => set((s) => ({
        skills: s.skills.map(sk => sk.id === id ? { ...sk, ...data } : sk)
      })),
      deleteSkill: (id) => set((s) => ({
        skills: s.skills.filter(sk => sk.id !== id)
      })),
      toggleSkillActive: (id) => set((s) => {
        const skill = s.skills.find(sk => sk.id === id);
        if (!skill) return s;
        if (!skill.active) {
          const activeCount = s.skills.filter(sk => sk.active).length;
          if (activeCount >= s.settings.maxActiveSkills) return s;
        }
        return { skills: s.skills.map(sk => sk.id === id ? { ...sk, active: !sk.active } : sk) };
      }),

      // Routine CRUD
      addRoutine: (data) => set((s) => ({
        routines: [...s.routines, { ...data, id: genId(), completed: false, streak: 0 }]
      })),
      updateRoutine: (id, data) => set((s) => ({
        routines: s.routines.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      deleteRoutine: (id) => set((s) => ({
        routines: s.routines.filter(r => r.id !== id)
      })),
      toggleRoutineActive: (id) => set((s) => ({
        routines: s.routines.map(r => r.id === id ? { ...r, active: !r.active } : r)
      })),
      toggleRoutineReminder: (id) => set((s) => ({
        routines: s.routines.map(r => r.id === id ? { ...r, reminder: !r.reminder } : r)
      })),

      updateSettings: (newSettings) => set((s) => ({
        settings: { ...s.settings, ...newSettings }
      })),

      // Daily tasks CRUD
      addTask: (data) => set((s) => ({
        tasks: [...s.tasks, { ...data, id: genId(), realDuration: 0, completed: false, sessions: [], status: undefined }]
      })),
      updateTask: (id, data) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTask: (id) => set((s) => ({
        tasks: s.tasks.filter(t => t.id !== id)
      })),
      setTaskStatus: (id, status, avoidReason) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? {
          ...t,
          status,
          completed: status === 'terminée',
          avoidReason: status === 'évitée' ? avoidReason : undefined,
        } : t)
      })),
      addTaskTimerSession: (taskId, session) => set((s) => ({
        tasks: s.tasks.map(t =>
          t.id === taskId
            ? { ...t, sessions: [...t.sessions, session], realDuration: t.realDuration + session.duration }
            : t
        )
      })),

      // Project CRUD
      addProject: (data) => set((s) => ({
        projects: [...s.projects, { ...data, id: genId(), realTime: 0, tasks: [] }]
      })),
      updateProject: (id, data) => set((s) => ({
        projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProject: (id) => set((s) => ({
        projects: s.projects.filter(p => p.id !== id)
      })),

      // Project tasks
      addProjectTask: (projectId, taskData) => set((s) => ({
        projects: s.projects.map(p =>
          p.id === projectId
            ? { ...p, tasks: [...p.tasks, { ...taskData, id: genId(), realDuration: 0, completed: false, sessions: [], projectId }] }
            : p
        )
      })),
      updateProjectTask: (projectId, taskId, data) => set((s) => ({
        projects: s.projects.map(p =>
          p.id === projectId
            ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...data } : t) }
            : p
        )
      })),
      deleteProjectTask: (projectId, taskId) => set((s) => ({
        projects: s.projects.map(p =>
          p.id === projectId
            ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
            : p
        )
      })),
      toggleProjectTask: (projectId, taskId) => set((s) => ({
        projects: s.projects.map(p =>
          p.id === projectId
            ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
            : p
        )
      })),
      addTimerSession: (projectId, taskId, session) => set((s) => ({
        projects: s.projects.map(p =>
          p.id === projectId
            ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId
                  ? { ...t, sessions: [...t.sessions, session], realDuration: t.realDuration + session.duration }
                  : t
              ),
              realTime: p.realTime + Math.round(session.duration / 60),
            }
            : p
        )
      })),
      updateProjectTaskRealDuration: (projectId, taskId, seconds) => set((s) => ({
        projects: s.projects.map(p =>
          p.id === projectId
            ? {
              ...p,
              tasks: p.tasks.map(t => t.id === taskId ? { ...t, realDuration: Math.round(seconds / 60) } : t),
            }
            : p
        )
      })),

      // Formation CRUD
      addFormation: (data) => set((s) => ({
        formations: [...s.formations, { ...data, id: genId(), modules: [] }]
      })),
      updateFormation: (id, data) => set((s) => ({
        formations: s.formations.map(f => f.id === id ? { ...f, ...data } : f)
      })),
      deleteFormation: (id) => set((s) => ({
        formations: s.formations.filter(f => f.id !== id)
      })),
      addFormationModule: (formationId, name) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? { ...f, modules: [...f.modules, { id: genId(), name, sessions: [] }] }
            : f
        )
      })),
      updateFormationModule: (formationId, moduleId, name) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? { ...f, modules: f.modules.map(m => m.id === moduleId ? { ...m, name } : m) }
            : f
        )
      })),
      deleteFormationModule: (formationId, moduleId) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? { ...f, modules: f.modules.filter(m => m.id !== moduleId) }
            : f
        )
      })),
      addFormationSession: (formationId, moduleId, session) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? {
              ...f,
              modules: f.modules.map(m =>
                m.id === moduleId
                  ? { ...m, sessions: [...m.sessions, { ...session, id: genId(), completed: false, realDuration: 0 }] }
                  : m
              )
            }
            : f
        )
      })),
      updateFormationSession: (formationId, moduleId, sessionId, data) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? {
              ...f,
              modules: f.modules.map(m =>
                m.id === moduleId
                  ? { ...m, sessions: m.sessions.map(se => se.id === sessionId ? { ...se, ...data } : se) }
                  : m
              )
            }
            : f
        )
      })),
      deleteFormationSession: (formationId, moduleId, sessionId) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? {
              ...f,
              modules: f.modules.map(m =>
                m.id === moduleId
                  ? { ...m, sessions: m.sessions.filter(se => se.id !== sessionId) }
                  : m
              )
            }
            : f
        )
      })),
      toggleFormationSession: (formationId, moduleId, sessionId) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? {
              ...f,
              modules: f.modules.map(m =>
                m.id === moduleId
                  ? { ...m, sessions: m.sessions.map(se => se.id === sessionId ? { ...se, completed: !se.completed } : se) }
                  : m
              )
            }
            : f
        )
      })),
      addFormationSessionTime: (formationId, moduleId, sessionId, minutes) => set((s) => ({
        formations: s.formations.map(f =>
          f.id === formationId
            ? {
              ...f,
              modules: f.modules.map(m =>
                m.id === moduleId
                  ? { ...m, sessions: m.sessions.map(se => se.id === sessionId ? { ...se, realDuration: se.realDuration + minutes } : se) }
                  : m
              )
            }
            : f
        )
      })),

      // Objectives CRUD
      addObjective: (data) => set((s) => ({
        objectives: [...s.objectives, { ...data, id: genId() }]
      })),
      updateObjective: (id, data) => set((s) => ({
        objectives: s.objectives.map(o => o.id === id ? { ...o, ...data } : o)
      })),
      deleteObjective: (id) => set((s) => ({
        objectives: s.objectives.filter(o => o.id !== id)
      })),
    }),
    { name: 'discipline-app' }
  )
);
