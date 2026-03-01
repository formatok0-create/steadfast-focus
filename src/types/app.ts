export interface Task {
  id: string;
  name: string;
  day: string;
  duration: number; // minutes
  realDuration: number;
  category: string;
  projectId?: string;
  skillId?: string;
  completed: boolean;
  strict: boolean;
  sessions: TimerSession[];
}

export interface TimerSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number;
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

export interface MonthlyObjective {
  id: string;
  main: string;
  secondary: string[];
  habitToReinforce: string;
  behaviorToEliminate: string;
  review?: string;
}
