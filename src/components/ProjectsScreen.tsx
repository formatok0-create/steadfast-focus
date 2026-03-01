import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, Plus, ArrowLeft, Trash2, Edit3, CheckCircle2, Circle, Square, ChevronRight, Flame, CalendarIcon } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Project, Task } from '@/types/app';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectTaskFormModal } from './ProjectTaskFormModal';
import { ProjectTaskChrono } from './ProjectTaskChrono';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const statusConfig = {
  en_cours: { label: 'En cours', color: 'text-primary', bg: 'bg-primary/10' },
  en_pause: { label: 'En pause', color: 'text-warning', bg: 'bg-warning/10' },
  terminé: { label: 'Terminé', color: 'text-success', bg: 'bg-success/10' },
};

const priorityConfig = {
  haute: { label: 'Haute', color: 'text-destructive', bg: 'bg-destructive/15' },
  moyenne: { label: 'Moyenne', color: 'text-warning', bg: 'bg-warning/15' },
  basse: { label: 'Basse', color: 'text-muted-foreground', bg: 'bg-muted' },
};

export const ProjectsScreen = () => {
  const { projects, deleteProject } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProjectId(null)} />;
  }

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
            <p className="text-sm text-muted-foreground mt-1">{projects.filter(p => p.status === 'en_cours').length} en cours · {projects.length} total</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary"
          >
            <Plus size={20} />
          </button>
        </motion.div>

        {projects.map((project) => {
          const completedTasks = project.tasks.filter(t => t.completed).length;
          const totalTasks = project.tasks.length;
          const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          const timeProgress = project.estimatedTime > 0 ? Math.min((project.realTime / project.estimatedTime) * 100, 100) : 0;
          const cfg = statusConfig[project.status];
          const priCfg = priorityConfig[project.priority];

          return (
            <motion.div key={project.id} variants={item}>
              <button
                onClick={() => setSelectedProjectId(project.id)}
                className="glass-card-elevated p-5 space-y-4 w-full text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{project.objective}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priCfg.color} ${priCfg.bg}`}>
                      {priCfg.label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.color} ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span className="font-mono">{project.realTime}h / {project.estimatedTime}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span className="font-mono">{completedTasks}/{totalTasks} tâches</span>
                  </div>
                </div>

                {/* Dual progress bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Temps</span>
                      <span className="font-mono">{Math.round(timeProgress)}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${timeProgress}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Tâches</span>
                      <span className="font-mono">{Math.round(taskProgress)}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-success rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${taskProgress}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-primary font-medium pt-1">
                  <span>Détails</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            </motion.div>
          );
        })}

        {projects.length === 0 && (
          <motion.div variants={item} className="glass-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucun projet. Crée ton premier projet.</p>
          </motion.div>
        )}
      </motion.div>

      <ProjectFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editProject && (
        <ProjectFormModal
          open={true}
          onClose={() => setEditProject(null)}
          project={editProject}
        />
      )}
    </>
  );
};

// ===== PROJECT DETAIL VIEW =====
const ProjectDetail = ({ project, onBack }: { project: Project; onBack: () => void }) => {
  const { updateProject, deleteProject, deleteProjectTask, toggleProjectTask } = useAppStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalEstimated = project.tasks.reduce((a, t) => a + t.duration, 0);
  const totalReal = project.tasks.reduce((a, t) => a + t.realDuration, 0);
  const cfg = statusConfig[project.status];

  const handleStatusChange = (status: Project['status']) => {
    updateProject(project.id, { status });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4 pt-2 pb-28 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{project.objective}</p>
          </div>
          <button onClick={() => setShowEditModal(true)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
            <Edit3 size={16} />
          </button>
        </div>

        {/* Status & Priority */}
        <div className="flex gap-2">
          {(['en_cours', 'en_pause', 'terminé'] as const).map(st => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                project.status === st
                  ? `${statusConfig[st].bg} ${statusConfig[st].color} border border-current/20`
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {statusConfig[st].label}
            </button>
          ))}
        </div>

        {/* Time overview */}
        <div className="glass-card-elevated p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-semibold text-foreground/80">Temps global</span>
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-2xl font-bold font-mono text-foreground">{project.realTime}h</p>
              <p className="text-[10px] text-muted-foreground">Réel</p>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <p className="text-2xl font-bold font-mono text-muted-foreground">{project.estimatedTime}h</p>
              <p className="text-[10px] text-muted-foreground">Estimé</p>
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${project.realTime > project.estimatedTime ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-accent'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((project.realTime / project.estimatedTime) * 100, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          {project.realTime > project.estimatedTime && (
            <p className="text-[10px] text-destructive font-semibold">⚠ Dépassement de {project.realTime - project.estimatedTime}h</p>
          )}
        </div>

        {/* Dates */}
        <div className="glass-card p-4 flex gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon size={12} />
            <span>Début : <span className="text-foreground font-mono">{project.startDate}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon size={12} />
            <span>Fin : <span className="text-foreground font-mono">{project.endDate}</span></span>
          </div>
        </div>

        {/* Task time comparison */}
        <div className="glass-card p-4 space-y-2">
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Comparaison temps tâches</span>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Estimé : </span>
              <span className="font-mono text-foreground">{totalEstimated} min</span>
            </div>
            <div>
              <span className="text-muted-foreground">Réel : </span>
              <span className={`font-mono ${totalReal > totalEstimated ? 'text-destructive' : 'text-success'}`}>{totalReal} min</span>
            </div>
            <div>
              <span className="text-muted-foreground">Écart : </span>
              <span className={`font-mono ${totalReal - totalEstimated > 0 ? 'text-destructive' : 'text-success'}`}>
                {totalReal - totalEstimated > 0 ? '+' : ''}{totalReal - totalEstimated} min
              </span>
            </div>
          </div>
        </div>

        {/* Tasks section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground/80">Tâches du projet</h2>
            <span className="text-xs text-muted-foreground font-mono">{completedTasks}/{project.tasks.length}</span>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-lg"
          >
            <Plus size={14} />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {project.tasks.map(task => (
            <ProjectTaskCard
              key={task.id}
              task={task}
              projectId={project.id}
              expanded={expandedTaskId === task.id}
              onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
            />
          ))}
          {project.tasks.length === 0 && (
            <div className="glass-card p-6 text-center">
              <p className="text-xs text-muted-foreground">Aucune tâche. Ajoute ta première tâche.</p>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="pt-4">
          <button
            onClick={() => { deleteProject(project.id); onBack(); }}
            className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Supprimer ce projet
          </button>
        </div>
      </motion.div>

      <ProjectFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
      />

      <ProjectTaskFormModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={project.id}
      />
    </>
  );
};

// ===== PROJECT TASK CARD =====
const ProjectTaskCard = ({
  task, projectId, expanded, onToggleExpand
}: {
  task: Task; projectId: string; expanded: boolean; onToggleExpand: () => void;
}) => {
  const { toggleProjectTask, deleteProjectTask } = useAppStore();

  return (
    <div className="glass-card-elevated p-4 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={() => toggleProjectTask(projectId, task.id)}>
          {task.completed ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <Circle size={18} className="text-muted-foreground" />
          )}
        </button>
        <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.name}
          </p>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{task.category}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{task.day}</span>
            {task.strict && <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-semibold">STRICT</span>}
          </div>
        </button>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-muted-foreground">{task.duration}m</p>
          <p className={`text-[10px] font-mono ${task.realDuration > task.duration ? 'text-destructive' : 'text-success'}`}>
            {task.realDuration}m réel
          </p>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Chrono */}
            {!task.completed && (
              <ProjectTaskChrono task={task} projectId={projectId} />
            )}

            {/* Session history */}
            {task.sessions.length > 0 && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                <span className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">Historique des sessions</span>
                {task.sessions.map((session, i) => (
                  <div key={session.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center font-mono text-foreground/60">{i + 1}</div>
                    <span className="font-mono">
                      {session.startTime ? format(new Date(session.startTime), 'dd/MM HH:mm', { locale: fr }) : '—'}
                    </span>
                    <span className="text-foreground/40">→</span>
                    <span className="font-mono">
                      {session.endTime ? format(new Date(session.endTime), 'HH:mm', { locale: fr }) : '—'}
                    </span>
                    <span className="ml-auto font-mono text-foreground">{session.duration} min</span>
                  </div>
                ))}
              </div>
            )}

            {/* Time comparison bar */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Estimé vs Réel</span>
                <span className="font-mono">{task.realDuration}/{task.duration} min</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
                {/* Estimated marker */}
                <div className="absolute top-0 bottom-0 w-px bg-foreground/30" style={{ left: '100%' }} />
                <motion.div
                  className={`h-full rounded-full ${task.realDuration > task.duration ? 'bg-destructive' : 'bg-primary'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${task.duration > 0 ? Math.min((task.realDuration / task.duration) * 100, 100) : 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteProjectTask(projectId, task.id)}
              className="flex items-center gap-1 text-[10px] text-destructive font-medium pt-1"
            >
              <Trash2 size={12} />
              Supprimer cette tâche
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
