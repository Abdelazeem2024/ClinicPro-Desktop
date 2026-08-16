export type VisitType = 'كشف' | 'إعادة';

/** مفاتيح حالة الزيارة — للـ CSS والمنطق (بدون مسافات) */
export type VisitStatus =
  | 'waiting'
  | 'inside'
  | 'done'
  | 'revisit'
  | 'postponed'
  | 'cancelled';

/** النص العربي للعرض في الواجهة */
export const STATUS_LABELS: Record<VisitStatus, string> = {
  waiting: 'منتظر',
  inside: 'داخل الكشف',
  done: 'تم الانتهاء',
  revisit: 'إعادة',
  postponed: 'مؤجل',
  cancelled: 'ملغي'
};

/** تحويل الحالة القديمة (عربي) إلى المفتاح الجديد */
export function normalizeStatus(status: string): VisitStatus {
  const map: Record<string, VisitStatus> = {
    'منتظر': 'waiting',
    'داخل الكشف': 'inside',
    'تم الانتهاء': 'done',
    'إعادة': 'revisit',
    'مؤجل': 'postponed',
    'ملغي': 'cancelled',
    waiting: 'waiting',
    inside: 'inside',
    done: 'done',
    revisit: 'revisit',
    postponed: 'postponed',
    cancelled: 'cancelled'
  };
  return map[status] || 'waiting';
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  address: string;
  age: number | '';
  gender: 'ذكر' | 'أنثى' | '';
  notes: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  type: VisitType;
  fee: number;
  paid: number;
  remaining: number;
  status: VisitStatus;
  time: string;
  date: string; // YYYY-MM-DD محلي
  queueNumber: number;
  doctor?: string;
  /** سبب إلغاء الكشف (اختياري) */
  cancelReason?: string;
  cancelledAt?: string;
}

export interface ClinicSettings {
  clinicName: string;
  logo: string;
  primaryColor: string;
  backgroundColor: string;
  theme: 'light' | 'dark' | 'auto';
  reportsPassword: string;
  defaultFee: number;
  defaultRevisitFee: number;
  autoPrintTicket: boolean;
  /** مسار مجلد على جهاز المستخدم يتم فيه حفظ نسخة احتياطية تلقائية يوميًا */
  backupFolder: string;
}

export interface AppData {
  patients: Patient[];
  visits: Visit[];
  settings: ClinicSettings;
  version: string;
  /** وقت إنشاء النسخة (للاستيراد) */
  exportedAt?: string;
}

export const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'عيادتي الطبية',
  logo: '',
  primaryColor: '#0A7CFF',
  backgroundColor: '',
  theme: 'dark',
  reportsPassword: '1234',
  defaultFee: 100,
  defaultRevisitFee: 50,
  autoPrintTicket: false,
  backupFolder: ''
};

export const APP_VERSION = '1.1.0';
export const SCHEMA_VERSION = 2;
