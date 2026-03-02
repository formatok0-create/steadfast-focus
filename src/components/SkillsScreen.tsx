import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Plus, Edit2, Trash2, Link, BookOpen, FolderOpen, CheckSquare, AlertTriangle, Power, Zap, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import type { Skill } from '@/types/app';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const levelColors: Record<string, string> = {
  'débutant': 'text-accent',
  'intermédiaire': 'text-primary',
  'avancé': 'text-success',
};

const levelLabels: Record<string, string> = {
  'débutant': '🌱 Débutant',
  'intermédiaire': '📈 Intermédiaire',
  'avancé': '🏆 Avancé',
};

export const SkillsScreen = () => {
  const { skills, projects, formations, tasks, settings, addSkill, updateSkill, deleteSkill, toggleSkillActive } = useAppStore();
  const activeSkills = skills.filter(s => s.active);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [level, setLevel] = useState<Skill['level']>('débutant');
  const [weeklyTarget, setWeeklyTarget] = useState(5);
  const [active, setActive] = useState(true);

  const openCreate = () => {
    setEditingSkill(null);
    setName(''); setObjective(''); setLevel('débutant'); setWeeklyTarget(5); setActive(true);
    setShowModal(true);
  };

  const openEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setName(skill.name); setObjective(skill.objective); setLevel(skill.level);
    setWeeklyTarget(skill.weeklyTarget); setActive(skill.active);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingSkill) {
      updateSkill(editingSkill.id, { name, objective, level, weeklyTarget, active });
    } else {
      addSkill({ name, objective, level, weeklyTarget, active });
    }
    setShowModal(false);
  };

  const getLinkedProjects = (skillId: string) => projects.filter(p => p.tasks.some(t => t.skillId === skillId));
  const getLinkedFormations = (skillId: string) => formations.filter(f => f.skillId === skillId);
  const getLinkedTasks = (skillId: string) => tasks.filter(t => t.skillId === skillId);

  const canActivate = activeSkills.length < settings.maxActiveSkills;
  const totalRealTime = skills.reduce((a, s) => a + s.realTime, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Compétences<span className="text-gradient">.</span></h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeSkills.length}/{settings.maxActiveSkills} actives
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={openCreate}
          className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg glow-primary"
        >
          <Plus size={20} />
        </motion.button>
      </motion.div>

      {/* Limit warning */}
      {activeSkills.length >= settings.maxActiveSkills && (
        <motion.div variants={item} className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertTriangle size={14} className="text-destructive" />
          <span className="text-xs text-destructive font-medium">Limite atteinte — désactive une compétence pour en ajouter une nouvelle.</span>
        </motion.div>
      )}

      {/* Stats overview */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="stat-card stat-card-blue text-center">
          <Target size={18} className="mx-auto mb-2 text-primary" />
          <p className="text-2xl font-black text-foreground">{skills.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Total</p>
        </div>
        <div className="stat-card stat-card-violet text-center">
          <Zap size={18} className="mx-auto mb-2 text-accent" />
          <p className="text-2xl font-black text-foreground">{activeSkills.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Actives</p>
        </div>
        <div className="stat-card stat-card-amber text-center">
          <Clock size={18} className="mx-auto mb-2 text-warning" />
          <p className="text-2xl font-black text-foreground">{totalRealTime}h</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Temps total</p>
        </div>
      </motion.div>

      {/* Skills list */}
      {skills.map((skill) => {
        const linkedProjects = getLinkedProjects(skill.id);
        const linkedFormations = getLinkedFormations(skill.id);
        const linkedTasks = getLinkedTasks(skill.id);
        const weeklyProgress = Math.min((skill.realTime / Math.max(skill.weeklyTarget * 4, 1)) * 100, 100);
        const isExpanded = expandedId === skill.id;

        return (
          <motion.div
            key={skill.id}
            variants={item}
            whileHover={{ scale: 1.01, y: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`glass-card-elevated p-5 space-y-4 relative overflow-hidden ${!skill.active ? 'opacity-50' : ''}`}
          >
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-5 gradient-primary blur-2xl" />

            {/* Header */}
            <div className="flex items-start justify-between relative z-10">
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : skill.id)}
              >
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <Target size={14} className="text-white" />
                </div>
                <h3 className="font-bold text-foreground">{skill.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${levelColors[skill.level]}`}>
                  {levelLabels[skill.level]}
                </span>
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => openEdit(skill)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                  <Edit2 size={12} className="text-primary" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => setConfirmDeleteId(skill.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 size={12} className="text-destructive" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleSkillActive(skill.id)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <Power size={12} className={skill.active ? 'text-primary' : 'text-muted-foreground'} />
                </motion.button>
              </div>
            </div>

            {/* Objective */}
            <p className="text-xs text-muted-foreground">{skill.objective}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-black font-mono text-foreground">{skill.realTime}<span className="text-primary">h</span></p>
                <p className="text-[10px] text-muted-foreground">Heures réelles</p>
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-muted-foreground">{skill.weeklyTarget}h</p>
                <p className="text-[10px] text-muted-foreground">Objectif / semaine</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                <TrendingUp size={12} className="text-primary" />
                <span className="font-medium">Progression — {Math.round(weeklyProgress)}%</span>
              </div>
              <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Linked items summary */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><FolderOpen size={10} className="text-primary" />{linkedProjects.length} projet(s)</span>
              <span className="flex items-center gap-1"><BookOpen size={10} className="text-accent" />{linkedFormations.length} formation(s)</span>
              <span className="flex items-center gap-1"><CheckSquare size={10} className="text-success" />{linkedTasks.length} tâche(s)</span>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {linkedProjects.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1 font-bold">
                        <Link size={10} /> Projets liés
                      </p>
                      {linkedProjects.map(p => (
                        <div key={p.id} className="flex items-center justify-between glass-card-bright rounded-xl px-3 py-2 mb-1">
                          <span className="text-xs text-foreground font-medium">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground">{p.status.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {linkedFormations.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1 font-bold">
                        <BookOpen size={10} /> Formations liées
                      </p>
                      {linkedFormations.map(f => {
                        const totalSessions = f.modules.reduce((a, m) => a + m.sessions.length, 0);
                        const done = f.modules.reduce((a, m) => a + m.sessions.filter(s => s.completed).length, 0);
                        return (
                          <div key={f.id} className="flex items-center justify-between glass-card-bright rounded-xl px-3 py-2 mb-1">
                            <span className="text-xs text-foreground font-medium">{f.name}</span>
                            <span className="text-[10px] text-muted-foreground">{done}/{totalSessions} séances</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {linkedTasks.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1 font-bold">
                        <CheckSquare size={10} /> Tâches liées
                      </p>
                      {linkedTasks.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between glass-card-bright rounded-xl px-3 py-2 mb-1">
                          <span className="text-xs text-foreground font-medium">{t.name}</span>
                          <span className={`text-[10px] ${t.completed ? 'text-success' : 'text-muted-foreground'}`}>
                            {t.completed ? '✅' : `${t.duration}min`}
                          </span>
                        </div>
                      ))}
                      {linkedTasks.length > 5 && (
                        <p className="text-[10px] text-muted-foreground text-center">+{linkedTasks.length - 5} autres</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEdit(skill)}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
                    >
                      <Edit2 size={12} /> Modifier
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setConfirmDeleteId(skill.id)}
                      className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={12} /> Supprimer
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {skills.length === 0 && (
        <motion.div variants={item} className="glass-card-bright p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 gradient-primary" />
          <Target size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Aucune compétence. Commence par en créer une.</p>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-3 bottom-0 z-50 glass-card-elevated rounded-t-3xl p-5 pb-24 space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  {editingSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
                </h2>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
                  ✕
                </motion.button>
              </div>

              {!canActivate && !editingSkill && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-destructive/10 text-xs text-destructive">
                  <AlertTriangle size={12} />
                  Limite de {settings.maxActiveSkills} compétences actives atteinte. La nouvelle sera inactive.
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Nom</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: React / TypeScript" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Objectif mesurable</Label>
                  <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ex: Maîtrise complète des hooks" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Niveau</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as Skill['level'])}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="débutant">🌱 Débutant</SelectItem>
                      <SelectItem value="intermédiaire">📈 Intermédiaire</SelectItem>
                      <SelectItem value="avancé">🏆 Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Temps hebdo engagé (heures)</Label>
                  <Input type="number" min={1} value={weeklyTarget} onChange={e => setWeeklyTarget(Number(e.target.value))} className="mt-1" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground text-sm font-semibold"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold ${name.trim() ? 'gradient-primary text-white shadow-lg glow-primary' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                  {editingSkill ? 'Enregistrer' : 'Créer'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        open={!!confirmDeleteId}
        title="Supprimer cette compétence ?"
        message="Les heures enregistrées seront perdues."
        onConfirm={() => { if (confirmDeleteId) deleteSkill(confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </motion.div>
  );
};
