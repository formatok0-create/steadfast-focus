import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, Plus, ArrowLeft, Trash2, Edit3, CheckCircle2, Circle, Square, ChevronRight, Flame, CalendarIcon, FolderOpen, TrendingUp, Zap } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { Project, Task } from '@/types/app';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectTaskFormModal } from './ProjectTaskFormModal';
import { ProjectTaskChrono } from './ProjectTaskChrono';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
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
  const activeCount = projects.filter(p => p.status === 'en_cours').length;
  const completedCount = projects.filter(p => p.status === 'terminé').length;
  const totalHours = projects.reduce((a, p) => a + p.realTime, 0);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProjectId(null)} />;
  }

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Projets<span className="text-gradient">.</span></h1>
            <p className="text-sm text-muted-foreground mt-1">{activeCount} en cours · {projects.length} total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateModal(true)}
            className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg glow-primary"
          >
            <Plus size={20} />
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <div className="stat-card stat-card-blue text-center">
            <FolderOpen size={18} className="mx-auto mb-2 text-primary" />
            <p className="text-2xl font-black text-foreground">{activeCount}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">En cours</p>
          </div>
          <div className="stat-card stat-card-green text-center">
            <CheckCircle2 size={18} className="mx-auto mb-2 text-success" />
            <p className="text-2xl font-black text-foreground">{completedCount}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Terminés</p>
          </div>
          <div className="stat-card stat-card-amber text-center">
            <Clock size={18} className="mx-auto mb-2 text-warning" />
            <p className="text-2xl font-black text-foreground">{totalHours}h</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Temps total</p>
          </div>
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
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setSelectedProjectId(project.id)}
                className="glass-card-elevated p-5 space-y-4 w-full text-left relative overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-5 gradient-primary blur-2xl" />
                <div className="flex items-start justify-between relative z-10">
                  {project.imageUrl && (
                    <img src={project.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover mr-3 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">{project.name}</h3>
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
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" />
                    <span className="font-mono">{project.realTime}h / {project.estimatedTime}h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-success" />
                    <span className="font-mono">{completedTasks}/{totalTasks} tâches</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Temps</span>
                      <span className="font-mono">{Math.round(timeProgress)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full gradient-cool rounded-full" initial={{ width: 0 }} animate={{ width: `${timeProgress}%` }} transition={{ duration: 1, delay: 0.3 }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Tâches</span>
                      <span className="font-mono">{Math.round(taskProgress)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full gradient-fresh rounded-full" initial={{ width: 0 }} animate={{ width: `${taskProgress}%` }} transition={{ duration: 1, delay: 0.4 }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-primary font-semibold pt-1">
                  <span>Détails</span>
                  <ChevronRight size={14} />
                </div>
              </motion.button>
            </motion.div>
          );
        })}

        {projects.length === 0 && (
          <motion.div variants={item} className="glass-card-bright p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 gradient-primary" />
            <FolderOpen size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucun projet. Crée ton premier projet.</p>
          </motion.div>
        )}
      </motion.div>

      <ProjectFormModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
      {editProject && (
        <ProjectFormModal open={true} onClose={() => setEditProject(null)} project={editProject} />
      )}
    </>
  );
};

// ===== PROJECT DETAIL VIEW =====
const ProjectDetail = ({ project, onBack }: { project: Project; onBack: () => void }) => {
  const { updateProject, deleteProject } = useAppStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalEstimated = project.tasks.reduce((a, t) => a + t.duration, 0);
  const totalReal = project.tasks.reduce((a, t) => a + t.realDuration, 0);

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
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onBack} className="w-10 h-10 rounded-2xl glass-card-bright flex items-center justify-center text-foreground">
            <ArrowLeft size={18} />
          </motion.button>
          {project.imageUrl && (
            <img src={project.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight truncate">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{project.objective}</p>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowEditModal(true)} className="w-10 h-10 rounded-2xl glass-card-bright flex items-center justify-center text-foreground">
            <Edit3 size={16} />
          </motion.button>
        </div>

        {/* Status */}
        <div className="flex gap-2">
          {(['en_cours', 'en_pause', 'terminé'] as const).map(st => (
            <motion.button
              key={st}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusChange(st)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                project.status === st
                  ? `${statusConfig[st].bg} ${statusConfig[st].color} border border-current/20 shadow-sm`
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {statusConfig[st].label}
            </motion.button>
          ))}
        </div>

        {/* Time overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-elevated p-6 space-y-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10 gradient-cool blur-3xl" />
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-cool flex items-center justify-center">
              <Clock size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-foreground/80">Temps global</span>
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-3xl font-black font-mono text-foreground">{project.realTime}<span className="text-primary">h</span></p>
              <p className="text-[10px] text-muted-foreground">Réel</p>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <p className="text-3xl font-black font-mono text-muted-foreground">{project.estimatedTime}h</p>
              <p className="text-[10px] text-muted-foreground">Estimé</p>
            </div>
          </div>
          <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${project.realTime > project.estimatedTime ? 'bg-destructive' : 'gradient-cool'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((project.realTime / project.estimatedTime) * 100, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          {project.realTime > project.estimatedTime && (
            <p className="text-[10px] text-destructive font-semibold">⚠ Dépassement de {project.realTime - project.estimatedTime}h</p>
          )}
        </motion.div>

        {/* Dates */}
        <div className="glass-card-bright p-4 flex gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon size={12} className="text-primary" />
            <span>Début : <span className="text-foreground font-mono">{project.startDate}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon size={12} className="text-accent" />
            <span>Fin : <span className="text-foreground font-mono">{project.endDate}</span></span>
          </div>
        </div>

        {/* Task time comparison */}
        <div className="glass-card-bright p-4 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-primary" />
            <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Comparaison temps tâches</span>
          </div>
          <div className="flex gap-4 text-xs">
            <div><span className="text-muted-foreground">Estimé : </span><span className="font-mono text-foreground">{totalEstimated} min</span></div>
            <div><span className="text-muted-foreground">Réel : </span><span className={`font-mono ${totalReal > totalEstimated ? 'text-destructive' : 'text-success'}`}>{totalReal} min</span></div>
            <div><span className="text-muted-foreground">Écart : </span><span className={`font-mono ${totalReal - totalEstimated > 0 ? 'text-destructive' : 'text-success'}`}>{totalReal - totalEstimated > 0 ? '+' : ''}{totalReal - totalEstimated} min</span></div>
          </div>
        </div>

        {/* Tasks section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <CheckCircle2 size={12} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-foreground/80">Tâches du projet</h2>
            <span className="text-xs text-muted-foreground font-mono">{completedTasks}/{project.tasks.length}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            className="flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-xl"
          >
            <Plus size={14} />
            Ajouter
          </motion.button>
        </div>

        <div className="space-y-3">
          {project.tasks.map(task => (
            <ProjectTaskCard
              key={task.id}
              task={task}
              projectId={project.id}
              expanded={expandedTaskId === task.id}
              onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              onEdit={() => { setEditingTask(task); setShowTaskModal(true); }}
            />
          ))}
          {project.tasks.length === 0 && (
            <div className="glass-card-bright p-8 text-center">
              <p className="text-xs text-muted-foreground">Aucune tâche. Ajoute ta première tâche.</p>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="pt-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmDeleteProject(true)}
            className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={14} />
            Supprimer ce projet
          </motion.button>
        </div>

        <ConfirmDeleteModal
          open={confirmDeleteProject}
          title="Supprimer ce projet ?"
          message="Toutes les tâches du projet seront supprimées."
          onConfirm={() => { deleteProject(project.id); onBack(); }}
          onCancel={() => setConfirmDeleteProject(false)}
        />
      </motion.div>

      <ProjectFormModal open={showEditModal} onClose={() => setShowEditModal(false)} project={project} />
      <ProjectTaskFormModal
        open={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        projectId={project.id}
        task={editingTask}
      />
    </>
  );
};

// ===== PROJECT TASK CARD =====
const ProjectTaskCard = ({
  task, projectId, expanded, onToggleExpand, onEdit
}: {
  task: Task; projectId: string; expanded: boolean; onToggleExpand: () => void; onEdit: () => void;
}) => {
  const { toggleProjectTask, deleteProjectTask } = useAppStore();
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="glass-card-elevated p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleProjectTask(projectId, task.id)}>
          {task.completed ? (
            <div className="w-6 h-6 rounded-full gradient-fresh flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary/60 transition-colors" />
          )}
        </motion.button>
        <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.name}
          </p>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{task.category}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">{task.day}</span>
            {task.strict && <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-bold">STRICT</span>}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xs font-mono text-muted-foreground">{task.duration}m</p>
            <p className={`text-[10px] font-mono ${task.realDuration > task.duration ? 'text-destructive' : 'text-success'}`}>
              {task.realDuration}m réel
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onEdit}
            className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Edit3 size={12} />
          </motion.button>
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
            {!task.completed && (
              <ProjectTaskChrono task={task} projectId={projectId} />
            )}

            {task.sessions.length > 0 && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Historique des sessions</span>
                {task.sessions.map((session, i) => (
                  <div key={session.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center font-mono text-primary text-[8px] font-bold">{i + 1}</div>
                    <span className="font-mono">{session.startTime ? format(new Date(session.startTime), 'dd/MM HH:mm', { locale: fr }) : '—'}</span>
                    <span className="text-foreground/40">→</span>
                    <span className="font-mono">{session.endTime ? format(new Date(session.endTime), 'HH:mm', { locale: fr }) : '—'}</span>
                    <span className="ml-auto font-mono text-foreground font-semibold">{session.duration} min</span>
                  </div>
                ))}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setConfirmDeleteTask(true)}
              className="flex items-center gap-1 text-[10px] text-destructive/60 font-medium pt-1 hover:text-destructive transition-colors"
            >
              <Trash2 size={10} />
              Supprimer
            </motion.button>

            <ConfirmDeleteModal
              open={confirmDeleteTask}
              title="Supprimer cette tâche ?"
              message="La tâche et ses sessions seront supprimées."
              onConfirm={() => { deleteProjectTask(projectId, task.id); setConfirmDeleteTask(false); }}
              onCancel={() => setConfirmDeleteTask(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
