'use strict';
/**
 * trial.cjs — إدارة الفترة التجريبية (3 أيام) وحالة التفعيل لبرنامج ClinicPro.
 *
 * القاعدة: لا نثق أبداً بعلامة "activated" وحدها — في كل استدعاء لـ getStatus()
 * نُعيد التحقق الكامل من كود الترخيص المخزَّن (توقيع + جهاز + صلاحية) عبر
 * license.cjs الحقيقي (نفس ملف "التحقق فقط" المولَّد من أداة التفعيل).
 *
 * حماية بسيطة من التلاعب بساعة النظام: نحتفظ بـ "آخر وقت رأيناه" ولا نسمح له
 * بالتراجع للخلف أبداً (نأخذ الأكبر بين الوقت الحالي وآخر وقت مُخزَّن). هذا
 * يمنع خدعة "رجّع ساعة الجهاز للخلف" لإطالة التجربة. هذا ليس حماية مطلقة
 * (برنامج أوفلاين بلا خادم لا يمكن حمايته 100% من مستخدم متمرّس يحذف ملف
 * الحالة يدوياً) لكنه رادع عملي كافٍ لأغلب الحالات.
 */
const fs = require('fs');
const path = require('path');
const license = require('./license.cjs');

const TRIAL_DAYS = 3;
const STATE_FILE_NAME = '.cp-license-state.json';

function statePath(userDataDir) {
  return path.join(userDataDir, STATE_FILE_NAME);
}

function loadState(userDataDir) {
  const file = statePath(userDataDir);
  if (fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (parsed && parsed.firstRunAt && parsed.lastSeenAt) return parsed;
    } catch {
      // ملف تالف — نعامله كأنه غير موجود ونعيد إنشاءه (لا نمنح تجربة جديدة
      // فوراً لأن firstRunAt سيُعاد ضبطه، لكن هذا سيناريو نادر جداً عملياً)
    }
  }
  const now = new Date().toISOString();
  const fresh = { firstRunAt: now, lastSeenAt: now, activationCode: null };
  saveState(userDataDir, fresh);
  return fresh;
}

function saveState(userDataDir, state) {
  try {
    fs.writeFileSync(statePath(userDataDir), JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('تعذّر حفظ حالة الترخيص:', err.message);
  }
}

/** الحالة الكاملة الحالية — تُستدعى عند إقلاع البرنامج وبشكل دوري */
function getStatus(userDataDir) {
  const state = loadState(userDataDir);
  const machineId = license.getMachineId();

  // منع تراجع الساعة: الوقت الفعلي = الأكبر بين الآن وآخر وقت مسجَّل
  const nowMs = Date.now();
  const lastSeenMs = Date.parse(state.lastSeenAt) || nowMs;
  const effectiveNowMs = Math.max(nowMs, lastSeenMs);
  state.lastSeenAt = new Date(effectiveNowMs).toISOString();
  saveState(userDataDir, state);

  if (state.activationCode) {
    const check = license.isStoredLicenseValid(state.activationCode, machineId);
    if (check.valid) {
      return {
        activated: true,
        machineId,
        licenseType: check.type,
        expiresAt: check.expiresAt || null,
        message: check.message,
        trialExpired: false,
        trialDaysLeft: null
      };
    }
    // كود مخزَّن لكنه أصبح غير صالح (انتهت صلاحيته السنوية، أو تلاعب بالملف،
    // أو تغيّر الجهاز) — نمنع الاستخدام حتى يُدخل العميل كوداً صالحاً جديداً
    return {
      activated: false,
      machineId,
      invalidStoredLicense: true,
      message: check.message,
      trialExpired: true,
      trialDaysLeft: 0
    };
  }

  const firstRunMs = Date.parse(state.firstRunAt) || effectiveNowMs;
  const elapsedDays = (effectiveNowMs - firstRunMs) / 86400000;
  const trialExpired = elapsedDays >= TRIAL_DAYS;
  const trialDaysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays));

  return {
    activated: false,
    machineId,
    invalidStoredLicense: false,
    trialExpired,
    trialDaysLeft,
    trialDays: TRIAL_DAYS
  };
}

/** محاولة تفعيل بكود أدخله العميل — يعمل دائماً بغض النظر عن حالة الحظر */
function activate(userDataDir, code) {
  const machineId = license.getMachineId();
  const trimmed = String(code || '').replace(/\s+/g, '');
  const check = license.verifyLicenseCode(trimmed, machineId);
  if (!check.valid) {
    return { success: false, message: check.message };
  }
  const state = loadState(userDataDir);
  state.activationCode = trimmed;
  saveState(userDataDir, state);
  return {
    success: true,
    licenseType: check.type,
    expiresAt: check.expiresAt || null,
    message: check.message
  };
}

module.exports = { TRIAL_DAYS, getStatus, activate, getMachineId: license.getMachineId };
