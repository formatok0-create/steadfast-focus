import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { MonthlyObjective } from '@/types/app';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface ObjectiveFormData {
  month: string;
  main: string;
  secondary1: string;
  secondary2: string;
  habitToReinforce: string;
  behaviorToEliminate: string;
  review: string;
  result: '' | 'réussi' | 'partiel' | 'échoué';
  lesson: string;
}

const emptyForm = (): ObjectiveFormData => ({
  month: new Date().toISOString().slice(0, 7),
  main: '',
  secondary1: '',
  secondary2: '',
  habitToReinforce: '',
  behaviorToEliminate: '',
  review: '',
  result: '',
  lesson: '',
});

const fromObjective = (o: MonthlyObjective): ObjectiveFormData => ({
  month: o.month,
  main: o.main,
  secondary1: o.secondary[0] || '',
  secondary2: o.secondary[1] || '',
  habitToReinforce: o.habitToReinforce,
  behaviorToEliminate: o.behaviorToEliminate,
  review: o.review || '',
  result: o.result || '',
  lesson: o.lesson || '',
});

export const ObjectivesScreen = () => {
  const { objectives, addObjective, updateObjective, deleteObjective } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ObjectiveFormData>(emptyForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const current = objectives[0];

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (o: MonthlyObjective) => {
    setForm(fromObjective(o));
    setEditingId(o.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.main.trim()) return;
    const secondary = [form.secondary1, form.secondary2].filter(Boolean);
    const data = {
      month: form.month,
      main: form.main.trim(),
      secondary,
      habitToReinforce: form.habitToReinforce.trim(),
      behaviorToEliminate: form.behaviorToEliminate.trim(),
      review: form.review.trim() || undefined,
      result: form.result || undefined,
      lesson: form.lesson.trim() || undefined,
    };
    if (editingId) {
      updateObjective(editingId, data);
    } else {
      addObjective(data as Omit<MonthlyObjective, 'id'>);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteObjective(id);
    setConfirmDeleteId(null);
  };

  const resultStyles = {
    réussi: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    partiel: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    échoué: { icon: Target, color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return `${months[parseInt(mo) - 1]} ${y}`;
  };

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28 space-y-5">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Objectifs<span className="text-gradient">.</span></h1>
            <p className="text-sm text-muted-foreground mt-1">
              {current ? monthLabel(current.month) : 'Aucun objectif'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openAdd}
            className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg glow-primary"
          >
            <Plus size={20} />
          </motion.button>
        </motion.div>

        {!current && (
          <motion.div variants={item} className="glass-card p-8 text-center space-y-3">
            <Target size={40} className="text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-sm">Aucun objectif défini pour ce mois</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={openAdd}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              Définir mes objectifs
            </motion.button>
          </motion.div>
        )}

        {objectives.map((obj) => (
          <motion.div key={obj.id} variants={item} className="space-y-4">
            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {monthLabel(obj.month)}
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(obj)}
                  className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                >
                  <Pencil size={14} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setConfirmDeleteId(obj.id)}
                  className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </div>

            {/* Main objective */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass-card-elevated p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Target size={16} className="text-primary" />
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Objectif principal</span>
              </div>
              <p className="text-base font-semibold text-foreground leading-relaxed">{obj.main}</p>
              {obj.result && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${resultStyles[obj.result].color} ${resultStyles[obj.result].bg}`}>
                  {(() => { const R = resultStyles[obj.result].icon; return <R size={12} />; })()}
                  {obj.result}
                </div>
              )}
            </motion.div>

            {/* Secondary */}
            {obj.secondary.length > 0 && (
              <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-4 space-y-3">
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Objectifs secondaires</span>
                <div className="space-y-2">
                  {obj.secondary.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Habit */}
            <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-success" />
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Habitude à renforcer</span>
              </div>
              <p className="text-sm text-foreground">{obj.habitToReinforce}</p>
            </motion.div>

            {/* Behavior */}
            <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDown size={14} className="text-destructive" />
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Comportement à éliminer</span>
              </div>
              <p className="text-sm text-foreground">{obj.behaviorToEliminate}</p>
            </motion.div>

            {/* Review */}
            {obj.review && (
              <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-4 space-y-2">
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Bilan</span>
                <p className="text-sm text-muted-foreground italic">{obj.review}</p>
                {obj.lesson && <p className="text-sm text-foreground mt-2">Leçon : {obj.lesson}</p>}
              </motion.div>
            )}

            {/* Separator between objectives */}
            {objectives.indexOf(obj) < objectives.length - 1 && (
              <div className="border-b border-border/30 my-2" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-elevated p-6 rounded-2xl max-w-sm w-full space-y-4"
            >
              <h3 className="text-lg font-bold text-foreground">Supprimer cet objectif ?</h3>
              <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium"
                >
                  Supprimer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-elevated w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 pb-24 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  {editingId ? 'Modifier l\'objectif' : 'Nouvel objectif mensuel'}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowModal(false)}>
                  <X size={20} className="text-muted-foreground" />
                </motion.button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mois</label>
                  <input
                    type="month"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Target size={12} className="inline mr-1 text-primary" />
                    Objectif principal *
                  </label>
                  <input
                    value={form.main}
                    onChange={(e) => setForm({ ...form, main: e.target.value })}
                    placeholder="Ex: Livrer le MVP de l'app"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Objectif secondaire 1</label>
                  <input
                    value={form.secondary1}
                    onChange={(e) => setForm({ ...form, secondary1: e.target.value })}
                    placeholder="Optionnel"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Objectif secondaire 2</label>
                  <input
                    value={form.secondary2}
                    onChange={(e) => setForm({ ...form, secondary2: e.target.value })}
                    placeholder="Optionnel"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <TrendingUp size={12} className="inline mr-1 text-success" />
                    Habitude à renforcer
                  </label>
                  <input
                    value={form.habitToReinforce}
                    onChange={(e) => setForm({ ...form, habitToReinforce: e.target.value })}
                    placeholder="Ex: Se lever à 5h30"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <TrendingDown size={12} className="inline mr-1 text-destructive" />
                    Comportement à éliminer
                  </label>
                  <input
                    value={form.behaviorToEliminate}
                    onChange={(e) => setForm({ ...form, behaviorToEliminate: e.target.value })}
                    placeholder="Ex: Réseaux sociaux le matin"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {editingId && (
                  <>
                    <div className="border-t border-border/30 pt-3">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Résultat</label>
                      <div className="flex gap-2 mt-2">
                        {(['réussi', 'partiel', 'échoué'] as const).map((r) => (
                          <motion.button
                            key={r}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setForm({ ...form, result: form.result === r ? '' : r })}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                              form.result === r
                                ? `${resultStyles[r].bg} ${resultStyles[r].color} ring-1 ring-current`
                                : 'bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {r}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bilan</label>
                      <textarea
                        value={form.review}
                        onChange={(e) => setForm({ ...form, review: e.target.value })}
                        placeholder="Bilan de fin de mois..."
                        rows={2}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leçon apprise</label>
                      <input
                        value={form.lesson}
                        onChange={(e) => setForm({ ...form, lesson: e.target.value })}
                        placeholder="Qu'as-tu appris ce mois ?"
                        className="w-full mt-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!form.main.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Save size={16} />
                {editingId ? 'Enregistrer' : 'Créer l\'objectif'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
