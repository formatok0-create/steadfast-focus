export interface TimerSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number;
}

export interface Task {
  id: string;
  name: string;
  day: string;
  startTime?: string; // HH:mm format, e.g. "08:30"
  endTime?: string; // HH:mm format, e.g. "09:30"
  duration: number; // minutes
  realDuration: number;
  category: string;
  projectId?: string;
  skillId?: string;
  completed: boolean;
  strict: boolean;
  sessions: TimerSession[];
  status?: 'terminée' | 'incomplète' | 'évitée';
  avoidReason?: string;
}

export interface Project {
  id: string;
  name: string;
  objective: string;
  priority: 'haute' | 'moyenne' | 'basse';
  startDate: string;
  endDate: string;
  estimatedTime: number;
  realTime: number;
  status: 'en_cours' | 'en_pause' | 'terminé';
  tasks: Task[];
}

export interface Routine {
  id: string;
  name: string;
  category: 'matin' | 'soir' | 'corps' | 'esprit' | 'spirituel';
  frequency: 'quotidien' | 'hebdomadaire';
  completed: boolean;
  streak: number;
  active: boolean;
  reminder?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  objective: string;
  level: 'débutant' | 'intermédiaire' | 'avancé';
  weeklyTarget: number;
  realTime: number;
  active: boolean;
}

export interface FormationModule {
  id: string;
  name: string;
  sessions: FormationSession[];
}

export interface FormationSession {
  id: string;
  name: string;
  duration: number; // minutes
  completed: boolean;
  realDuration: number;
  day?: string;
}

export interface Formation {
  id: string;
  name: string;
  skillId?: string;
  objective: string;
  totalDuration: number; // hours
  modules: FormationModule[];
  planningMode: 'auto' | 'manuel';
  status: 'en_cours' | 'en_pause' | 'terminée';
}

export interface MonthlyObjective {
  id: string;
  month: string; // YYYY-MM
  main: string;
  secondary: string[];
  habitToReinforce: string;
  behaviorToEliminate: string;
  review?: string;
  result?: 'réussi' | 'partiel' | 'échoué';
  lesson?: string;
}

export interface AppSettings {
  theme: 'sombre' | 'clair' | 'minimal';
  maxTasksPerDay: number;
  maxActiveSkills: number;
  strictMode: boolean;
  notificationTone: 'calme' | 'strict' | 'neutre';
  enabledSections: string[];
}

export interface DailyReview {
  id: string;
  day: string;
  honorable: boolean;
  taskRate: number; // % tasks completed
  routineRate: number; // % routines completed
  notes: string;
  wins: string;
  lesson: string;
  mood: 'excellent' | 'bon' | 'moyen' | 'difficile';
  completedAt: number;
}
