import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Plus, Edit2, Trash2, Link, BookOpen, FolderOpen, CheckSquare, AlertTriangle, Power } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Skill } from '@/types/app';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const levelColors: Record<string, string> = {
  'débutant': 'text-accent',
  'intermédiaire': 'text-primary',
  'avancé': 'text-green-400',
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

  // Form state
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

  const getLinkedProjects = (skillId: string) =>
    projects.filter(p => p.tasks.some(t => t.skillId === skillId));

  const getLinkedFormations = (skillId: string) =>
    formations.filter(f => f.skillId === skillId);

  const getLinkedTasks = (skillId: string) =>
    tasks.filter(t => t.skillId === skillId);

  const canActivate = activeSkills.length < settings.maxActiveSkills;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compétences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeSkills.length}/{settings.maxActiveSkills} actives — max {settings.maxActiveSkills} en parallèle
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus size={14} /> Ajouter
        </Button>
      </motion.div>

      {/* Limit warning */}
      {activeSkills.length >= settings.maxActiveSkills && (
        <motion.div variants={item} className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertTriangle size={14} className="text-destructive" />
          <span className="text-xs text-destructive">Limite atteinte — désactive une compétence pour en ajouter une nouvelle.</span>
        </motion.div>
      )}

      {/* Stats overview */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-bold font-mono text-foreground">{skills.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-bold font-mono text-primary">{activeSkills.length}</p>
          <p className="text-[10px] text-muted-foreground">Actives</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xl font-bold font-mono text-foreground">{skills.reduce((a, s) => a + s.realTime, 0)}h</p>
          <p className="text-[10px] text-muted-foreground">Temps total</p>
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
            className={`glass-card-elevated p-5 space-y-4 transition-opacity ${!skill.active ? 'opacity-50' : ''}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : skill.id)}
              >
                <Target size={16} className="text-primary" />
                <h3 className="font-semibold text-foreground">{skill.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold ${levelColors[skill.level]}`}>
                  {levelLabels[skill.level]}
                </span>
                <button onClick={() => toggleSkillActive(skill.id)} className="p-1 rounded hover:bg-muted/50">
                  <Power size={12} className={skill.active ? 'text-primary' : 'text-muted-foreground'} />
                </button>
              </div>
            </div>

            {/* Objective */}
            <p className="text-xs text-muted-foreground">{skill.objective}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">{skill.realTime}h</p>
                <p className="text-[10px] text-muted-foreground">Heures réelles</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-muted-foreground">{skill.weeklyTarget}h</p>
                <p className="text-[10px] text-muted-foreground">Objectif / semaine</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                <TrendingUp size={12} />
                <span>Progression globale — {Math.round(weeklyProgress)}%</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>

            {/* Linked items summary */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><FolderOpen size={10} />{linkedProjects.length} projet(s)</span>
              <span className="flex items-center gap-1"><BookOpen size={10} />{linkedFormations.length} formation(s)</span>
              <span className="flex items-center gap-1"><CheckSquare size={10} />{linkedTasks.length} tâche(s)</span>
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
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Link size={10} /> Projets liés
                      </p>
                      {linkedProjects.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 mb-1">
                          <span className="text-xs text-foreground">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground">{p.status.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {linkedFormations.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <BookOpen size={10} /> Formations liées
                      </p>
                      {linkedFormations.map(f => {
                        const totalSessions = f.modules.reduce((a, m) => a + m.sessions.length, 0);
                        const done = f.modules.reduce((a, m) => a + m.sessions.filter(s => s.completed).length, 0);
                        return (
                          <div key={f.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 mb-1">
                            <span className="text-xs text-foreground">{f.name}</span>
                            <span className="text-[10px] text-muted-foreground">{done}/{totalSessions} séances</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {linkedTasks.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <CheckSquare size={10} /> Tâches liées
                      </p>
                      {linkedTasks.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 mb-1">
                          <span className="text-xs text-foreground">{t.name}</span>
                          <span className={`text-[10px] ${t.completed ? 'text-green-400' : 'text-muted-foreground'}`}>
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
                    <Button size="sm" variant="outline" onClick={() => openEdit(skill)} className="gap-1 text-xs flex-1">
                      <Edit2 size={12} /> Modifier
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteSkill(skill.id)} className="gap-1 text-xs text-destructive hover:text-destructive">
                      <Trash2 size={12} /> Supprimer
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {skills.length === 0 && (
        <motion.div variants={item} className="glass-card p-8 text-center">
          <Target size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Aucune compétence. Commence par en créer une.</p>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="glass-card-elevated w-full max-w-md p-6 space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-foreground">
                {editingSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
              </h2>

              {!canActivate && !editingSkill && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-xs text-destructive">
                  <AlertTriangle size={12} />
                  Limite de {settings.maxActiveSkills} compétences actives atteinte. La nouvelle sera inactive.
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Nom</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: React / TypeScript" />
                </div>
                <div>
                  <Label className="text-xs">Objectif mesurable</Label>
                  <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ex: Maîtrise complète des hooks" />
                </div>
                <div>
                  <Label className="text-xs">Niveau</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as Skill['level'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="débutant">🌱 Débutant</SelectItem>
                      <SelectItem value="intermédiaire">📈 Intermédiaire</SelectItem>
                      <SelectItem value="avancé">🏆 Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Temps hebdo engagé (heures)</Label>
                  <Input type="number" min={1} value={weeklyTarget} onChange={e => setWeeklyTarget(Number(e.target.value))} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Annuler</Button>
                <Button onClick={handleSave} className="flex-1" disabled={!name.trim()}>
                  {editingSkill ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
