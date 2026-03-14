import { motion } from 'framer-motion';
import { Settings, Palette, Minimize2, Bell, Shield, Download, Eye, EyeOff, Trash2, BellRing, Flame, Zap, Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useNotifications } from '@/hooks/useNotifications';
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
  { value: 'focus' as const, label: 'Focus', description: 'Bleu profond', gradient: 'from-blue-500 to-indigo-600', preview: 'bg-blue-500' },
  { value: 'energy' as const, label: 'Energy', description: 'Orange vibrant', gradient: 'from-orange-500 to-rose-500', preview: 'bg-orange-500' },
  { value: 'calm' as const, label: 'Calm', description: 'Violet apaisant', gradient: 'from-purple-500 to-pink-500', preview: 'bg-purple-500' },
  { value: 'minimal' as const, label: 'Minimal', description: 'Noir & blanc', gradient: 'from-gray-400 to-gray-600', preview: 'bg-gray-500' },
];

const toneOptions = [
  { value: 'calme' as const, label: 'Calme' },
  { value: 'strict' as const, label: 'Strict' },
  { value: 'neutre' as const, label: 'Neutre' },
];

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
  const { requestPermission } = useNotifications();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
  };

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
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-extrabold tracking-tight">Profil<span className="text-gradient">.</span></h1>
        <p className="text-sm text-muted-foreground mt-1">Personnalise ton expérience</p>
      </motion.div>

      {/* Theme Selection — Premium Widget */}
      <motion.div variants={item} className="widget-card-glow space-y-4">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 gradient-primary blur-3xl" />
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Palette size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Thème visuel</h2>
            <p className="text-[10px] text-muted-foreground">Change l'ambiance de l'app</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 relative z-10">
          {themeOptions.map(opt => {
            const active = settings.theme === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => updateSettings({ theme: opt.value })}
                className={`relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
                  active
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-br opacity-10 gradient-primary" />
                )}
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${opt.gradient} mb-2`} />
                <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.description}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Limits Widget */}
      <motion.div variants={item} className="widget-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-cool flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Limites</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Tâches par jour</p>
            <p className="text-[10px] text-muted-foreground">Maximum autorisé</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateSettings({ maxTasksPerDay: Math.max(1, settings.maxTasksPerDay - 1) })}
              className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground text-sm font-bold hover:bg-muted transition-colors"
            >−</motion.button>
            <span className="w-8 text-center font-mono font-bold text-foreground text-lg">{settings.maxTasksPerDay}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateSettings({ maxTasksPerDay: Math.min(12, settings.maxTasksPerDay + 1) })}
              className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground text-sm font-bold hover:bg-muted transition-colors"
            >+</motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Compétences actives</p>
            <p className="text-[10px] text-muted-foreground">Maximum en parallèle</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateSettings({ maxActiveSkills: Math.max(1, settings.maxActiveSkills - 1) })}
              className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground text-sm font-bold hover:bg-muted transition-colors"
            >−</motion.button>
            <span className="w-8 text-center font-mono font-bold text-foreground text-lg">{settings.maxActiveSkills}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateSettings({ maxActiveSkills: Math.min(4, settings.maxActiveSkills + 1) })}
              className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground text-sm font-bold hover:bg-muted transition-colors"
            >+</motion.button>
          </div>
        </div>
      </motion.div>

      {/* Strict Mode Widget */}
      <motion.div variants={item} className="widget-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-warm flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Mode strict</p>
              <p className="text-[10px] text-muted-foreground">Discipline renforcée</p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ strictMode: !settings.strictMode })}
            className={`w-14 h-8 rounded-full transition-all duration-300 relative ${settings.strictMode ? 'bg-primary glow-primary' : 'bg-muted'}`}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-white absolute top-1"
              animate={{ left: settings.strictMode ? 30 : 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          </button>
        </div>
      </motion.div>

      {/* Notification Tone Widget */}
      <motion.div variants={item} className="widget-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Bell size={16} className="text-white" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Ton des notifications</h2>
        </div>
        <div className="flex gap-2">
          {toneOptions.map(opt => {
            const active = settings.notificationTone === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSettings({ notificationTone: opt.value })}
                className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${
                  active ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10' : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications Widget */}
      <motion.div variants={item} className="widget-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-fresh flex items-center justify-center">
            <BellRing size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Rappels quotidiens</h2>
            <p className="text-[10px] text-muted-foreground">Matin (6h30) · Midi (12h) · Soir (21h)</p>
          </div>
        </div>
        {notifStatus === 'granted' ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/25">
            <Bell size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">Notifications activées ✓</span>
          </div>
        ) : notifStatus === 'denied' ? (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/25">
            <span className="text-xs text-destructive">Notifications bloquées. Active-les dans les paramètres de ton navigateur.</span>
          </div>
        ) : notifStatus === 'unsupported' ? (
          <div className="px-4 py-3 rounded-xl bg-muted/50">
            <span className="text-xs text-muted-foreground">Notifications non supportées sur cet appareil.</span>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleEnableNotifications}
            className="w-full py-3 rounded-xl gradient-primary text-white text-sm font-bold flex items-center justify-center gap-2 glow-primary"
          >
            <BellRing size={16} />
            Activer les notifications
          </motion.button>
        )}
      </motion.div>

      {/* Sections Widget */}
      <motion.div variants={item} className="widget-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-cool flex items-center justify-center">
            <Settings size={16} className="text-white" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Sections visibles</h2>
        </div>
        <div className="space-y-1">
          {Object.entries(sectionLabels).map(([key, label]) => {
            const enabled = settings.enabledSections.includes(key);
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <span className={`text-sm ${enabled ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                {enabled ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} className="text-muted-foreground" />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Export */}
      <motion.div variants={item}>
        <motion.button whileTap={{ scale: 0.97 }} className="widget-card w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary">
          <Download size={16} />
          Exporter les données
        </motion.button>
      </motion.div>

      {/* Reset */}
      <motion.div variants={item} className="space-y-2">
        {!showResetConfirm ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowResetConfirm(true)}
            className="widget-card w-full flex items-center justify-center gap-2 text-sm font-semibold text-destructive border border-destructive/20"
          >
            <Trash2 size={16} />
            Réinitialiser toute l'application
          </motion.button>
        ) : (
          <div className="widget-card-glow space-y-3 border border-destructive/30">
            <p className="text-sm font-semibold text-destructive text-center">⚠️ Supprimer toutes les données ?</p>
            <p className="text-xs text-muted-foreground text-center">Tâches, projets, routines, compétences, formations, objectifs et revues seront supprimés définitivement.</p>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-medium text-foreground"
              >
                Annuler
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetAll(); setShowResetConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold"
              >
                Tout supprimer
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
