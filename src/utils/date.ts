/**
 * تواريخ محلية فقط — لا تستخدم toISOString() لحساب اليوم/الشهر
 * لأن toISOString تحول إلى UTC وقد تغيّر اليوم في مصر والمناطق الزمنية الأخرى.
 */

/** تاريخ اليوم المحلي بصيغة YYYY-MM-DD */
export function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** وقت محلي HH:MM */
export function getLocalTimeString(d: Date = new Date()): string {
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

/** بداية الشهر الحالي YYYY-MM-01 */
export function getLocalMonthStart(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

/** نهاية الشهر الحالي */
export function getLocalMonthEnd(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth();
  const last = new Date(y, m + 1, 0);
  return getLocalDateString(last);
}

/** هل التاريخ (YYYY-MM-DD) هو اليوم المحلي؟ */
export function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

/** تاريخ ووقت محلي للعرض في النسخ الاحتياطية */
export function getLocalDateTimeLabel(d: Date = new Date()): string {
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
