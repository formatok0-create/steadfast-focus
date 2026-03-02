import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

interface ReminderConfig {
  id: string;
  label: string;
  hour: number;
  minute: number;
  getMessage: (tone: 'calme' | 'strict' | 'neutre') => { title: string; body: string };
}

const REMINDERS: ReminderConfig[] = [
  {
    id: 'morning',
    label: 'Matin — Intention',
    hour: 6,
    minute: 30,
    getMessage: (tone) => {
      if (tone === 'strict') return { title: '⚔️ Debout, soldat.', body: 'Définis ton intention. Pas d\'excuses aujourd\'hui.' };
      if (tone === 'calme') return { title: '🌅 Bonjour', body: 'Quelle est ton intention pour aujourd\'hui ?' };
      return { title: '📋 Nouvelle journée', body: 'Définis tes priorités du jour.' };
    },
  },
  {
    id: 'midday',
    label: 'Journée — Discipline',
    hour: 12,
    minute: 0,
    getMessage: (tone) => {
      if (tone === 'strict') return { title: '🔥 Pas de relâchement.', body: 'Vérifie tes tâches. Tu avances ou tu recules.' };
      if (tone === 'calme') return { title: '☀️ Mi-journée', body: 'Comment avancent tes tâches ? Continue comme ça.' };
      return { title: '📊 Point mi-journée', body: 'Vérifie l\'avancement de tes tâches.' };
    },
  },
  {
    id: 'evening',
    label: 'Soir — Introspection',
    hour: 21,
    minute: 0,
    getMessage: (tone) => {
      if (tone === 'strict') return { title: '🪖 Bilan de guerre.', body: 'Fais ta revue. Pas de sommeil sans bilan.' };
      if (tone === 'calme') return { title: '🌙 Fin de journée', body: 'Prends un moment pour ta revue quotidienne.' };
      return { title: '📝 Revue du soir', body: 'N\'oublie pas ta revue quotidienne.' };
    },
  },
];

export const useNotifications = () => {
  const { settings } = useAppStore();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' });
  }, []);

  const scheduleReminders = useCallback(() => {
    // Clear previous
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const now = new Date();

    REMINDERS.forEach((reminder) => {
      const target = new Date();
      target.setHours(reminder.hour, reminder.minute, 0, 0);

      // If time already passed today, schedule for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();
      const msg = reminder.getMessage(settings.notificationTone);

      const timeout = setTimeout(() => {
        sendNotification(msg.title, msg.body);
        // Reschedule for next day
        scheduleReminders();
      }, delay);

      timeoutsRef.current.push(timeout);
    });
  }, [settings.notificationTone, sendNotification]);

  useEffect(() => {
    requestPermission().then((granted) => {
      if (granted) scheduleReminders();
    });

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [requestPermission, scheduleReminders]);

  return { requestPermission, sendNotification };
};
