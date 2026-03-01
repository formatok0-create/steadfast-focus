import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Minimize2, Bell, Shield, Download, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const themeOptions = [
  { value: 'sombre', label: 'Sombre', icon: Moon },
  { value: 'clair', label: 'Clair', icon: Sun },
  { value: 'minimal', label: 'Minimal', icon: Minimize2 },
] as const;

const toneOptions = [
  { value: 'calme', label: 'Calme' },
  { value: 'strict', label: 'Strict' },
  { value: 'neutre', label: 'Neutre' },
] as const;

const sectionLabels: Record<string, string> = {
  dashboard: 'Accueil',
  projects: 'Projets',
  tasks: 'Tâches',
  routines: 'Routines',
  skills: 'Compétences',
  formations: 'Formations',
  planning: 'Planning',
  objectives: 'Objectifs',
  stats: 'Statistiques',
};

export const SettingsScreen = () => {
  const { settings, updateSettings, resetAll } = useAppStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleSection = (section: string) => {
    const current = settings.enabledSections;
    if (current.includes(section)) {
      updateSettings({ enabledSections: current.filter(s => s !== section) });
    } else {
      updateSettings({ enabledSections: [...current, section] });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Personnalise ton expérience</p>
      </motion.div>

      {/* Theme */}
      <motion.div variants={item} className="glass-card-elevated p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-primary" />
          <span className="text-sm font-semibold text-foreground/80">Thème</span>
        </div>
        <div className="flex gap-2">
          {themeOptions.map(opt => {
            const Icon = opt.icon;
            const active = settings.theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateSettings({ theme: opt.value })}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
                  active ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Limits */}
      <motion.div variants={item} className="glass-card p-5 space-y-4">
        <span className="text-sm font-semibold text-foreground/80">Limites</span>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Tâches par jour</p>
            <p className="text-[10px] text-muted-foreground">Maximum autorisé</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ maxTasksPerDay: Math.max(1, settings.maxTasksPerDay - 1) })}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground text-sm font-bold"
            >−</button>
            <span className="w-8 text-center font-mono font-bold text-foreground">{settings.maxTasksPerDay}</span>
            <button
              onClick={() => updateSettings({ maxTasksPerDay: Math.min(12, settings.maxTasksPerDay + 1) })}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground text-sm font-bold"
            >+</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Compétences actives</p>
            <p className="text-[10px] text-muted-foreground">Maximum en parallèle</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ maxActiveSkills: Math.max(1, settings.maxActiveSkills - 1) })}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground text-sm font-bold"
            >−</button>
            <span className="w-8 text-center font-mono font-bold text-foreground">{settings.maxActiveSkills}</span>
            <button
              onClick={() => updateSettings({ maxActiveSkills: Math.min(4, settings.maxActiveSkills + 1) })}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground text-sm font-bold"
            >+</button>
          </div>
        </div>
      </motion.div>

      {/* Strict mode */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">Mode strict global</p>
              <p className="text-[10px] text-muted-foreground">Discipline renforcée</p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ strictMode: !settings.strictMode })}
            className={`w-12 h-7 rounded-full transition-colors relative ${settings.strictMode ? 'bg-warning' : 'bg-muted'}`}
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-foreground absolute top-1"
              animate={{ left: settings.strictMode ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          </button>
        </div>
      </motion.div>

      {/* Notification tone */}
      <motion.div variants={item} className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-primary" />
          <span className="text-sm font-semibold text-foreground/80">Ton des notifications</span>
        </div>
        <div className="flex gap-2">
          {toneOptions.map(opt => {
            const active = settings.notificationTone === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateSettings({ notificationTone: opt.value })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  active ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Sections visibility */}
      <motion.div variants={item} className="glass-card p-5 space-y-3">
        <span className="text-sm font-semibold text-foreground/80">Sections visibles</span>
        <div className="space-y-2">
          {Object.entries(sectionLabels).map(([key, label]) => {
            const enabled = settings.enabledSections.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between py-2"
              >
                <span className={`text-sm ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                {enabled ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} className="text-muted-foreground" />}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Export */}
      <motion.div variants={item}>
        <button className="glass-card p-4 w-full flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <Download size={16} />
          Exporter les données
        </button>
      </motion.div>

      {/* Reset all */}
      <motion.div variants={item} className="space-y-2">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="glass-card p-4 w-full flex items-center justify-center gap-2 text-sm font-medium text-destructive border border-destructive/20"
          >
            <Trash2 size={16} />
            Réinitialiser toute l'application
          </button>
        ) : (
          <div className="glass-card-elevated p-5 space-y-3 border border-destructive/30">
            <p className="text-sm font-semibold text-destructive text-center">⚠️ Supprimer toutes les données ?</p>
            <p className="text-xs text-muted-foreground text-center">Tâches, projets, routines, compétences, formations, objectifs et revues seront supprimés définitivement.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-medium text-foreground"
              >
                Annuler
              </button>
              <button
                onClick={() => { resetAll(); setShowResetConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold"
              >
                Tout supprimer
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
