import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Circle, Clock, ChevronDown, ChevronRight, Plus, Trash2, Edit2, Play, Pause, RotateCcw, GraduationCap, Target, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Formation, FormationModule, FormationSession } from '@/types/app';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const FormationsScreen = () => {
  const { formations, skills, addFormation, deleteFormation } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);

  const totalSessions = formations.flatMap(f => f.modules.flatMap(m => m.sessions));
  const completedCount = totalSessions.filter(s => s.completed).length;
  const totalHoursReal = Math.round(totalSessions.reduce((a, s) => a + s.realDuration, 0) / 60);
  const totalHoursPlanned = formations.reduce((a, f) => a + f.totalDuration, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Formations</h1>
          <p className="text-sm text-muted-foreground mt-1">{formations.length} formation{formations.length > 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => { setEditingFormation(null); setShowForm(true); }} className="gap-1.5">
          <Plus size={14} /> Nouvelle
        </Button>
      </motion.div>

      {/* Global stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold text-primary">{completedCount}/{totalSessions.length}</p>
          <p className="text-[10px] text-muted-foreground">Séances</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold text-accent">{totalHoursReal}h</p>
          <p className="text-[10px] text-muted-foreground">Réelles</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold text-foreground">{totalHoursPlanned}h</p>
          <p className="text-[10px] text-muted-foreground">Prévues</p>
        </div>
      </motion.div>

      {formations.map(formation => (
        <motion.div key={formation.id} variants={item}>
          <FormationCard
            formation={formation}
            skillName={skills.find(s => s.id === formation.skillId)?.name}
            onEdit={() => { setEditingFormation(formation); setShowForm(true); }}
            onDelete={() => deleteFormation(formation.id)}
          />
        </motion.div>
      ))}

      {formations.length === 0 && (
        <motion.div variants={item} className="text-center py-12 text-muted-foreground">
          <GraduationCap size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune formation. Crée ta première !</p>
        </motion.div>
      )}

      <FormationFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        formation={editingFormation}
      />
    </motion.div>
  );
};

/* =================== FORMATION CARD =================== */
const FormationCard = ({
  formation, skillName, onEdit, onDelete
}: {
  formation: Formation; skillName?: string; onEdit: () => void; onDelete: () => void;
}) => {
  const { addFormationModule, deleteFormationModule, addFormationSession, toggleFormationSession, deleteFormationSession, addFormationSessionTime, updateFormation } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [addingSessionTo, setAddingSessionTo] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({ name: '', duration: 30 });

  const allSessions = formation.modules.flatMap(m => m.sessions);
  const completedSessions = allSessions.filter(s => s.completed).length;
  const totalSessions = allSessions.length;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const totalRealMin = allSessions.reduce((a, s) => a + s.realDuration, 0);
  const totalPlannedMin = allSessions.reduce((a, s) => a + s.duration, 0);

  const diff = totalRealMin - totalPlannedMin;
  const diffLabel = diff > 0 ? `+${diff}m retard` : diff < 0 ? `${Math.abs(diff)}m avance` : 'dans les temps';
  const diffColor = diff > 0 ? 'text-destructive' : diff < 0 ? 'text-success' : 'text-muted-foreground';

  const statusLabels: Record<string, string> = { en_cours: '▶ En cours', en_pause: '⏸ Pause', terminée: '✅ Terminée' };

  const handleAddModule = () => {
    if (!newModuleName.trim()) return;
    addFormationModule(formation.id, newModuleName.trim());
    setNewModuleName('');
    setAddingModule(false);
  };

  const handleAddSession = (moduleId: string) => {
    if (!newSession.name.trim() || newSession.duration <= 0) return;
    addFormationSession(formation.id, moduleId, { name: newSession.name.trim(), duration: newSession.duration });
    setNewSession({ name: '', duration: 30 });
    setAddingSessionTo(null);
  };

  return (
    <div className="glass-card-elevated p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary shrink-0" />
            <h3 className="font-semibold text-foreground truncate">{formation.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{formation.objective}</p>
          {skillName && (
            <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              🎯 {skillName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Select
            value={formation.status}
            onValueChange={(v) => updateFormation(formation.id, { status: v as Formation['status'] })}
          >
            <SelectTrigger className="h-7 text-[10px] w-auto min-w-[100px] border-none bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_cours">▶ En cours</SelectItem>
              <SelectItem value="en_pause">⏸ Pause</SelectItem>
              <SelectItem value="terminée">✅ Terminée</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={onEdit} className="text-muted-foreground hover:text-primary transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{completedSessions}/{totalSessions} séances</span>
          <span className="font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Time stats */}
      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span className="font-mono">{Math.floor(totalRealMin / 60)}h{(totalRealMin % 60).toString().padStart(2, '0')}</span>
          <span>réel</span>
        </div>
        <span className="font-mono">{Math.floor(totalPlannedMin / 60)}h{(totalPlannedMin % 60).toString().padStart(2, '0')} prévu</span>
        <span className={`font-mono font-semibold ${diffColor}`}>{diffLabel}</span>
      </div>

      {/* Expand modules */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary font-medium"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {expanded ? 'Masquer les modules' : `Voir les modules (${formation.modules.length})`}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 border-t border-border/50"
          >
            {formation.modules.map(mod => (
              <div key={mod.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">{mod.name}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddingSessionTo(addingSessionTo === mod.id ? null : mod.id)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      + Séance
                    </button>
                    <button
                      onClick={() => deleteFormationModule(formation.id, mod.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Add session form */}
                {addingSessionTo === mod.id && (
                  <div className="flex gap-2 items-end pl-2">
                    <Input
                      placeholder="Nom de la séance"
                      value={newSession.name}
                      onChange={e => setNewSession(p => ({ ...p, name: e.target.value }))}
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Min"
                      value={newSession.duration}
                      onChange={e => setNewSession(p => ({ ...p, duration: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-xs w-16"
                    />
                    <Button size="sm" className="h-8 text-xs" onClick={() => handleAddSession(mod.id)}>OK</Button>
                  </div>
                )}

                {mod.sessions.map(session => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    formationId={formation.id}
                    moduleId={mod.id}
                  />
                ))}
              </div>
            ))}

            {/* Add module */}
            {addingModule ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nom du module"
                  value={newModuleName}
                  onChange={e => setNewModuleName(e.target.value)}
                  className="h-8 text-xs flex-1"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddModule()}
                />
                <Button size="sm" className="h-8 text-xs" onClick={handleAddModule}>Ajouter</Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAddingModule(false)}>✕</Button>
              </div>
            ) : (
              <button
                onClick={() => setAddingModule(true)}
                className="text-xs text-primary/70 hover:text-primary flex items-center gap-1"
              >
                <Plus size={12} /> Ajouter un module
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =================== SESSION ROW WITH CHRONO =================== */
const SessionRow = ({
  session, formationId, moduleId
}: {
  session: FormationSession; formationId: string; moduleId: string;
}) => {
  const { toggleFormationSession, deleteFormationSession, addFormationSessionTime } = useAppStore();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setRunning(true);
    setElapsed(0);
    intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    if (elapsed > 0) {
      const minutes = Math.max(1, Math.round(elapsed / 60));
      addFormationSessionTime(formationId, moduleId, session.id, minutes);
    }
    setElapsed(0);
  }, [elapsed, formationId, moduleId, session.id, addFormationSessionTime]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 pl-2 group">
      <button onClick={() => toggleFormationSession(formationId, moduleId, session.id)}>
        {session.completed ? (
          <CheckCircle2 size={14} className="text-success shrink-0" />
        ) : (
          <Circle size={14} className="text-muted-foreground shrink-0 hover:text-primary transition-colors" />
        )}
      </button>
      <span className={`text-xs flex-1 ${session.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
        {session.name}
      </span>
      {/* Real vs planned */}
      <span className="text-[10px] font-mono text-muted-foreground">
        {session.realDuration > 0 && <span className="text-primary">{session.realDuration}m</span>}
        {session.realDuration > 0 && ' / '}
        {session.duration}m
      </span>
      {/* Chrono */}
      {!session.completed && (
        <div className="flex items-center gap-1">
          {running ? (
            <>
              <span className="text-[10px] font-mono text-primary animate-pulse">{formatTime(elapsed)}</span>
              <button onClick={stopTimer} className="text-destructive hover:text-destructive/80">
                <Pause size={12} />
              </button>
            </>
          ) : (
            <button onClick={startTimer} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={12} />
            </button>
          )}
        </div>
      )}
      <button
        onClick={() => deleteFormationSession(formationId, moduleId, session.id)}
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
};

/* =================== FORMATION FORM MODAL =================== */
const FormationFormModal = ({
  open, onClose, formation
}: {
  open: boolean; onClose: () => void; formation: Formation | null;
}) => {
  const { skills, addFormation, updateFormation } = useAppStore();
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [skillId, setSkillId] = useState('');
  const [totalDuration, setTotalDuration] = useState(10);
  const [planningMode, setPlanningMode] = useState<'auto' | 'manuel'>('manuel');
  const [status, setStatus] = useState<Formation['status']>('en_cours');

  useEffect(() => {
    if (formation) {
      setName(formation.name);
      setObjective(formation.objective);
      setSkillId(formation.skillId || '');
      setTotalDuration(formation.totalDuration);
      setPlanningMode(formation.planningMode);
      setStatus(formation.status);
    } else {
      setName(''); setObjective(''); setSkillId(''); setTotalDuration(10); setPlanningMode('manuel'); setStatus('en_cours');
    }
  }, [formation, open]);

  const handleSubmit = () => {
    if (!name.trim() || !objective.trim()) return;
    const data = {
      name: name.trim(),
      objective: objective.trim(),
      skillId: skillId || undefined,
      totalDuration,
      planningMode,
      status,
    };
    if (formation) {
      updateFormation(formation.id, data);
    } else {
      addFormation(data as any);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>{formation ? 'Modifier la formation' : 'Nouvelle formation'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nom</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: React Avancé" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Objectif final</label>
            <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ex: Maîtriser les patterns" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Compétence liée</label>
            <Select value={skillId} onValueChange={setSkillId}>
              <SelectTrigger><SelectValue placeholder="Choisir une compétence" /></SelectTrigger>
              <SelectContent>
                {skills.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Durée totale (heures)</label>
              <Input type="number" value={totalDuration} onChange={e => setTotalDuration(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Planning</label>
              <Select value={planningMode} onValueChange={(v) => setPlanningMode(v as 'auto' | 'manuel')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manuel">Manuel</SelectItem>
                  <SelectItem value="auto">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">{formation ? 'Mettre à jour' : 'Créer la formation'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
