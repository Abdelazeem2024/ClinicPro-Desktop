import type { AppData, Patient, Visit, ClinicSettings } from '../types';
import { DEFAULT_SETTINGS, normalizeStatus, APP_VERSION } from '../types';
import { getLocalDateString } from './date';

const STORAGE_KEY = 'clinic-pro-data-v1';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        patients: [],
        visits: [],
        settings: { ...DEFAULT_SETTINGS },
        version: APP_VERSION
      };
    }
    const data = JSON.parse(raw) as AppData;
    data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    data.patients = data.patients || [];
    // تطبيع حالات الزيارات القديمة (عربي → مفاتيح إنجليزية)
    data.visits = (data.visits || []).map(v => ({
      ...v,
      status: normalizeStatus(v.status as string)
    }));
    data.version = data.version || APP_VERSION;
    return data;
  } catch {
    return {
      patients: [],
      visits: [],
      settings: { ...DEFAULT_SETTINGS },
      version: APP_VERSION
    };
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Save failed', e);
  }
}

export function exportData(data: AppData): string {
  return JSON.stringify(
    {
      ...data,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      schemaVersion: 2
    },
    null,
    2
  );
}

export function importData(json: string): AppData | null {
  try {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object') return null;
    if (!Array.isArray(data.patients) || !Array.isArray(data.visits)) return null;
    if (!data.settings || typeof data.settings !== 'object') return null;
    if (data.patients.length > 0) {
      const p = data.patients[0];
      if (!p.id || !p.name) return null;
    }
    if (data.visits.length > 0) {
      const v = data.visits[0];
      if (!v.id || !v.patientId || !v.date) return null;
    }
    const visits = (data.visits as Visit[]).map(v => ({
      ...v,
      status: normalizeStatus(v.status as string)
    }));
    return {
      patients: data.patients,
      visits,
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      version: data.version || APP_VERSION,
      exportedAt: data.exportedAt
    };
  } catch {
    return null;
  }
}

/** زيارات اليوم المحلي فقط */
export function getTodayVisits(visits: Visit[]): Visit[] {
  const today = getLocalDateString();
  return visits
    .filter(v => v.date === today)
    .sort((a, b) => a.queueNumber - b.queueNumber);
}

/**
 * إحصائيات اليوم:
 * - الكشوفات/الإعادات: تستبعد الملغاة
 * - الإيراد: يستبعد المدفوع في الزيارات الملغاة
 * - المنتظرين: حالة waiting فقط
 */
export function getTodayStats(visits: Visit[]) {
  const today = getTodayVisits(visits);
  const active = today.filter(v => v.status !== 'cancelled');
  const exams = active.filter(v => v.type === 'كشف').length;
  const revisits = active.filter(v => v.type === 'إعادة').length;
  const revenue = active.reduce((sum, v) => sum + (v.paid || 0), 0);
  const waiting = today.filter(v => v.status === 'waiting').length;
  return { exams, revisits, revenue, waiting, total: active.length };
}

/** إيراد فترة (يستبعد الملغاة) */
export function getPeriodStats(visits: Visit[], from: string, to: string) {
  const filtered = visits.filter(
    v => v.date >= from && v.date <= to && v.status !== 'cancelled'
  );
  const exams = filtered.filter(v => v.type === 'كشف').length;
  const revisits = filtered.filter(v => v.type === 'إعادة').length;
  const revenue = filtered.reduce((sum, v) => sum + (v.paid || 0), 0);
  return { exams, revisits, revenue, total: filtered.length, visits: filtered };
}
