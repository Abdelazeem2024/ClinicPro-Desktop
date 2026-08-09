import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppData,
  Patient,
  Visit,
  ClinicSettings,
  VisitType,
  VisitStatus
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { loadData, saveData, getTodayVisits, getTodayStats } from '../utils/storage';
import { getLocalDateString, getLocalTimeString } from '../utils/date';

interface AppContextType {
  data: AppData;
  patients: Patient[];
  visits: Visit[];
  settings: ClinicSettings;
  todayVisits: Visit[];
  stats: ReturnType<typeof getTodayStats>;
  // patients
  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  findPatients: (query: string) => Patient[];
  // visits
  addVisit: (v: Omit<Visit, 'id' | 'queueNumber' | 'date' | 'time' | 'remaining'>) => Visit;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  /** إلغاء كشف: يغيّر الحالة إلى cancelled دون حذف السجل، ولا يعيد استخدام رقم الدور */
  cancelVisit: (id: string, reason?: string) => void;
  // settings
  updateSettings: (s: Partial<ClinicSettings>) => void;
  // bulk
  replaceData: (newData: AppData) => void;
  // theme helpers
  isDark: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  // Auto-save on every change
  useEffect(() => {
    saveData(data);
  }, [data]);

  // نسخ احتياطي تلقائي عند الإغلاق + مرة يوميًا في الخلفية (Electron)
  useEffect(() => {
    const runBackup = () => {
      try {
        if (window.electronAPI?.autoBackup) {
          window.electronAPI.autoBackup(data);
        }
      } catch (_) {}
    };

    // عند إغلاق النافذة من Electron
    if (window.electronAPI?.onAppClosing) {
      window.electronAPI.onAppClosing(() => runBackup());
    }

    // نسخة يومية خفيفة عند فتح التطبيق (مرة واحدة)
    const dailyKey = 'clinic-pro-daily-backup-date';
    const today = (() => {
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    })();
    if (localStorage.getItem(dailyKey) !== today) {
      runBackup();
      localStorage.setItem(dailyKey, today);
    }

    // قبل إغلاق التبويب/النافذة
    const onBeforeUnload = () => { runBackup(); };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [data]);

  // Theme detection
  const [systemDark, setSystemDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = useMemo(() => {
    if (data.settings.theme === 'dark') return true;
    if (data.settings.theme === 'light') return false;
    return systemDark;
  }, [data.settings.theme, systemDark]);

  // Apply theme + primary color + optional background to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.style.setProperty('--primary', data.settings.primaryColor || '#0A7CFF');
    
    // Derive text colors based on theme for contrast
    if (isDark) {
      root.style.setProperty('--text-main', '#F1F5F9');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--bg-main', data.settings.backgroundColor || '#0F172A');
      root.style.setProperty('--bg-card', '#1E293B');
      root.style.setProperty('--bg-elevated', '#334155');
      root.style.setProperty('--border', '#334155');
    } else {
      root.style.setProperty('--text-main', '#0F172A');
      root.style.setProperty('--text-muted', '#64748B');
      root.style.setProperty('--bg-main', data.settings.backgroundColor || '#F8FAFC');
      root.style.setProperty('--bg-card', '#FFFFFF');
      root.style.setProperty('--bg-elevated', '#F1F5F9');
      root.style.setProperty('--border', '#E2E8F0');
    }
  }, [isDark, data.settings.primaryColor, data.settings.backgroundColor]);

  const addPatient = useCallback((p: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...p,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      patients: [...prev.patients, newPatient]
    }));
    return newPatient;
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setData(prev => ({
      ...prev,
      patients: prev.patients.map(p => (p.id === id ? { ...p, ...updates } : p))
    }));
  }, []);

  const findPatients = useCallback(
    (query: string) => {
      if (!query.trim()) return [];
      const q = query.trim().toLowerCase();
      return data.patients.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.address && p.address.toLowerCase().includes(q))
      );
    },
    [data.patients]
  );

  const addVisit = useCallback(
    (v: Omit<Visit, 'id' | 'queueNumber' | 'date' | 'time' | 'remaining'>) => {
      const today = getLocalDateString();
      const todayVisits = data.visits.filter(x => x.date === today);
      const nextQueue = todayVisits.length > 0
        ? Math.max(...todayVisits.map(x => x.queueNumber)) + 1
        : 1;

      const newVisit: Visit = {
        ...v,
        id: uuidv4(),
        queueNumber: nextQueue,
        date: today,
        time: getLocalTimeString(),
        remaining: Math.max(0, (v.fee || 0) - (v.paid || 0))
      };

      setData(prev => ({
        ...prev,
        visits: [...prev.visits, newVisit]
      }));
      return newVisit;
    },
    [data.visits]
  );

  const updateVisit = useCallback((id: string, updates: Partial<Visit>) => {
    setData(prev => ({
      ...prev,
      visits: prev.visits.map(v => {
        if (v.id !== id) return v;
        const updated = { ...v, ...updates };
        if (updates.fee !== undefined || updates.paid !== undefined) {
          updated.remaining = Math.max(0, (updated.fee || 0) - (updated.paid || 0));
        }
        return updated;
      })
    }));
  }, []);

  const cancelVisit = useCallback((id: string, reason?: string) => {
    setData(prev => ({
      ...prev,
      visits: prev.visits.map(v => {
        if (v.id !== id) return v;
        if (v.status === 'cancelled') return v;
        return {
          ...v,
          status: 'cancelled' as const,
          cancelReason: reason || '',
          cancelledAt: new Date().toISOString()
        };
      })
    }));
  }, []);

  const updateSettings = useCallback((s: Partial<ClinicSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...s }
    }));
  }, []);

  const replaceData = useCallback((newData: AppData) => {
    setData({
      ...newData,
      settings: { ...DEFAULT_SETTINGS, ...newData.settings }
    });
  }, []);

  const todayVisits = useMemo(() => getTodayVisits(data.visits), [data.visits]);
  const stats = useMemo(() => getTodayStats(data.visits), [data.visits]);

  const value: AppContextType = {
    data,
    patients: data.patients,
    visits: data.visits,
    settings: data.settings,
    todayVisits,
    stats,
    addPatient,
    updatePatient,
    findPatients,
    addVisit,
    updateVisit,
    cancelVisit,
    updateSettings,
    replaceData,
    isDark
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
