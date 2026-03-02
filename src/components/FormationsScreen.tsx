import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Circle, Clock, ChevronDown, ChevronRight, Plus, Trash2, Edit2, Play, Pause, RotateCcw, GraduationCap, Target, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Formation, FormationModule, FormationSession } from '@/types/app';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePicker } from '@/components/ImagePicker';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
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
          <h1 className="text-3xl font-extrabold tracking-tight">Formations<span className="text-gradient">.</span></h1>
          <p className="text-sm text-muted-foreground mt-1">{formations.length} formation{formations.length > 1 ? 's' : ''}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setEditingFormation(null); setShowForm(true); }}
          className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg glow-primary"
        >
          <Plus size={20} />
        </motion.button>
      </motion.div>

      {/* Global stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="stat-card stat-card-blue text-center">
          <CheckCircle2 size={18} className="mx-auto mb-2 text-primary" />
          <p className="text-2xl font-black text-foreground">{completedCount}<span className="text-muted-foreground text-sm font-normal">/{totalSessions.length}</span></p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Séances</p>
        </div>
        <div className="stat-card stat-card-violet text-center">
          <Clock size={18} className="mx-auto mb-2 text-accent" />
          <p className="text-2xl font-black text-foreground">{totalHoursReal}h</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Réelles</p>
        </div>
        <div className="stat-card stat-card-amber text-center">
          <TrendingUp size={18} className="mx-auto mb-2 text-warning" />
          <p className="text-2xl font-black text-foreground">{totalHoursPlanned}h</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">Prévues</p>
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
        <motion.div variants={item} className="glass-card-bright p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 gradient-primary" />
          <GraduationCap size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucune formation. Crée ta première !</p>
        </motion.div>
      )}

      <FormationFormModal open={showForm} onClose={() => setShowForm(false)} formation={editingFormation} />
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
  const totalSessionCount = allSessions.length;
  const progress = totalSessionCount > 0 ? (completedSessions / totalSessionCount) * 100 : 0;
  const totalRealMin = allSessions.reduce((a, s) => a + s.realDuration, 0);
  const totalPlannedMin = allSessions.reduce((a, s) => a + s.duration, 0);

  const diff = totalRealMin - totalPlannedMin;
  const diffLabel = diff > 0 ? `+${diff}m retard` : diff < 0 ? `${Math.abs(diff)}m avance` : 'dans les temps';
  const diffColor = diff > 0 ? 'text-destructive' : diff < 0 ? 'text-success' : 'text-muted-foreground';

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
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="glass-card-elevated p-5 space-y-4 relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-5 gradient-primary blur-2xl" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {formation.imageUrl ? (
              <img src={formation.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
            )}
            <h3 className="font-bold text-foreground truncate">{formation.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{formation.objective}</p>
          {skillName && (
            <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              🎯 {skillName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Select
            value={formation.status}
            onValueChange={(v) => updateFormation(formation.id, { status: v as Formation['status'] })}
          >
            <SelectTrigger className="h-7 text-[10px] w-auto min-w-[100px] border-none bg-muted/50 font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_cours">▶ En cours</SelectItem>
              <SelectItem value="en_pause">⏸ Pause</SelectItem>
              <SelectItem value="terminée">✅ Terminée</SelectItem>
            </SelectContent>
          </Select>
          <motion.button whileTap={{ scale: 0.8 }} onClick={onEdit} className="text-muted-foreground hover:text-primary transition-colors">
            <Edit2 size={14} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span className="font-medium">{completedSessions}/{totalSessionCount} séances</span>
          <span className="font-mono font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Time stats */}
      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-primary" />
          <span className="font-mono font-bold">{Math.floor(totalRealMin / 60)}h{(totalRealMin % 60).toString().padStart(2, '0')}</span>
          <span>réel</span>
        </div>
        <span className="font-mono">{Math.floor(totalPlannedMin / 60)}h{(totalPlannedMin % 60).toString().padStart(2, '0')} prévu</span>
        <span className={`font-mono font-bold ${diffColor}`}>{diffLabel}</span>
      </div>

      {/* Expand modules */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary font-semibold"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {expanded ? 'Masquer les modules' : `Voir les modules (${formation.modules.length})`}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-3 border-t border-border/50"
          >
            {formation.modules.map(mod => (
              <div key={mod.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground/70 uppercase tracking-wider">{mod.name}</p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setAddingSessionTo(addingSessionTo === mod.id ? null : mod.id)}
                      className="text-[10px] text-primary font-semibold hover:underline"
                    >
                      + Séance
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => deleteFormationModule(formation.id, mod.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </motion.button>
                  </div>
                </div>

                {addingSessionTo === mod.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex gap-2 items-end pl-2"
                  >
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
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddSession(mod.id)}
                      className="h-8 px-3 rounded-lg gradient-primary text-white text-xs font-bold"
                    >
                      OK
                    </motion.button>
                  </motion.div>
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
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleAddModule} className="h-8 px-3 rounded-lg gradient-primary text-white text-xs font-bold">
                  Ajouter
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAddingModule(false)} className="h-8 px-2 rounded-lg bg-muted text-foreground text-xs">
                  ✕
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setAddingModule(true)}
                className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 font-semibold"
              >
                <Plus size={12} /> Ajouter un module
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-2 pl-2 group"
    >
      <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleFormationSession(formationId, moduleId, session.id)}>
        {session.completed ? (
          <div className="w-5 h-5 rounded-full gradient-fresh flex items-center justify-center">
            <CheckCircle2 size={10} className="text-white" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary/60 transition-colors" />
        )}
      </motion.button>
      <span className={`text-xs flex-1 ${session.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
        {session.name}
      </span>
      <span className="text-[10px] font-mono text-muted-foreground">
        {session.realDuration > 0 && <span className="text-primary font-bold">{session.realDuration}m</span>}
        {session.realDuration > 0 && ' / '}
        {session.duration}m
      </span>
      {!session.completed && (
        <div className="flex items-center gap-1">
          {running ? (
            <>
              <span className="text-[10px] font-mono text-primary animate-pulse font-bold">{formatTime(elapsed)}</span>
              <motion.button whileTap={{ scale: 0.8 }} onClick={stopTimer} className="text-destructive hover:text-destructive/80">
                <Pause size={12} />
              </motion.button>
            </>
          ) : (
            <motion.button whileTap={{ scale: 0.8 }} onClick={startTimer} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={12} />
            </motion.button>
          )}
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => deleteFormationSession(formationId, moduleId, session.id)}
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={10} />
      </motion.button>
    </motion.div>
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
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (formation) {
      setName(formation.name);
      setObjective(formation.objective);
      setSkillId(formation.skillId || '');
      setTotalDuration(formation.totalDuration);
      setPlanningMode(formation.planningMode);
      setStatus(formation.status);
      setImageUrl(formation.imageUrl);
    } else {
      setName(''); setObjective(''); setSkillId(''); setTotalDuration(10); setPlanningMode('manuel'); setStatus('en_cours'); setImageUrl(undefined);
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
      imageUrl,
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
          <ImagePicker value={imageUrl} onChange={setImageUrl} label="Logo de la formation" />
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Nom</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Formation React avancé" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Objectif final</label>
            <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ex: Maîtriser les hooks avancés" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Compétence liée</label>
            <Select value={skillId} onValueChange={setSkillId}>
              <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {skills.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Durée totale (heures)</label>
            <Input type="number" min={1} value={totalDuration} onChange={e => setTotalDuration(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Mode de planning</label>
            <div className="flex gap-2">
              {(['manuel', 'auto'] as const).map(m => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlanningMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    planningMode === m ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {m === 'manuel' ? '✏️ Manuel' : '🤖 Auto'}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-muted text-foreground text-sm font-semibold"
            >
              Annuler
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!name.trim() || !objective.trim()}
              className={`flex-1 py-3 rounded-xl text-sm font-bold ${
                name.trim() && objective.trim() ? 'gradient-primary text-white shadow-lg glow-primary' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {formation ? 'Enregistrer' : 'Créer'}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
