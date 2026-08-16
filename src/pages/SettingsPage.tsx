import { useState, useEffect } from "react"
import { Download, Upload, Palette, Image, ShieldCheck, FolderCog } from "lucide-react"
import { useApp } from "../context/AppContext"
import { useLicense } from "../context/LicenseContext"
import ActivationForm from "../components/ActivationForm"
import { importData } from "../utils/storage"

declare global {
  interface Window {
    electronAPI?: {
      exportJson: (data: any) => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>
      importJson: () => Promise<{ success: boolean; data?: any; raw?: string; canceled?: boolean; error?: string }>
      autoBackup: (data: any) => Promise<{ success: boolean; path?: string; error?: string }>
      listBackups: () => Promise<{ success: boolean; files?: any[]; dir?: string; error?: string }>
      getAppVersion: () => Promise<string>
      onAppClosing: (cb: () => void) => void
      selectBackupFolder: () => Promise<{ success: boolean; folderPath?: string; canceled?: boolean }>
      backupToFolder: (data: any, folderPath: string) => Promise<{ success: boolean; path?: string; error?: string }>
      listFolderBackups: (folderPath: string) => Promise<{ success: boolean; files?: any[]; error?: string }>
    }
  }
}

export default function SettingsPage() {
  const { settings, updateSettings, data, replaceData } = useApp()
  const license = useLicense()
  const [msg, setMsg] = useState("")
  const [folderBackupCount, setFolderBackupCount] = useState<number | null>(null)
  const backupAvailable = typeof window !== "undefined" && !!window.electronAPI?.selectBackupFolder
  const [importPreview, setImportPreview] = useState<{
    data: any
    clinicName: string
    version: string
    exportedAt: string
    patientsCount: number
    visitsCount: number
    cancelledCount: number
    schemaVersion?: number | string
  } | null>(null)

  useEffect(() => {
    if (settings.backupFolder && window.electronAPI?.listFolderBackups) {
      window.electronAPI.listFolderBackups(settings.backupFolder).then(res => {
        setFolderBackupCount(res.success ? (res.files?.length ?? 0) : null)
      }).catch(() => setFolderBackupCount(null))
    } else {
      setFolderBackupCount(null)
    }
  }, [settings.backupFolder])

  const handleChooseBackupFolder = async () => {
    if (!window.electronAPI?.selectBackupFolder) return
    const res = await window.electronAPI.selectBackupFolder()
    if (res.success && res.folderPath) {
      updateSettings({ backupFolder: res.folderPath })
      // نسخة فورية أول ما يتم اختيار المجلد، بدل انتظار اليوم التالي
      const backupRes = await window.electronAPI.backupToFolder?.(data, res.folderPath)
      if (backupRes?.success) {
        setMsg("تم اختيار المجلد وحفظ أول نسخة احتياطية بنجاح")
        setTimeout(() => setMsg(""), 3000)
      }
    }
  }

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateSettings({ logo: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleExport = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.exportJson(data)
      if (res.success) setMsg("تم التصدير بنجاح: " + res.path)
      else if (!res.canceled) setMsg("خطأ: " + res.error)
    } else {
      // browser fallback
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `clinic-backup-${(() => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0") })()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMsg("تم تنزيل النسخة الاحتياطية")
    }
  }

  const buildPreview = (raw: any, rawStr?: string) => {
    const validated = importData(rawStr || JSON.stringify(raw))
    if (!validated) {
      setMsg("الملف غير صالح أو تالف أو غير متوافق")
      return
    }
    const visits = validated.visits || []
    const cancelledCount = visits.filter((v: any) => v.status === "cancelled" || v.status === "ملغي").length
    setImportPreview({
      data: validated,
      clinicName: validated.settings?.clinicName || "—",
      version: validated.version || "—",
      exportedAt: validated.exportedAt
        ? new Date(validated.exportedAt).toLocaleString("ar-EG")
        : "غير معروف",
      patientsCount: (validated.patients || []).length,
      visitsCount: visits.length,
      cancelledCount,
      schemaVersion: (raw as any).schemaVersion || (raw as any).SCHEMA_VERSION || "—"
    })
    setMsg("")
  }

  const handleImport = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.importJson()
      if (res.success && res.data) {
        buildPreview(res.data, res.raw)
      } else if (!res.canceled) setMsg("خطأ: " + (res.error || "غير معروف"))
    } else {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".json"
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        try {
          const textContent = await file.text()
          const raw = JSON.parse(textContent)
          buildPreview(raw, textContent)
        } catch {
          setMsg("ملف غير صالح أو تالف")
        }
      }
      input.click()
    }
  }

  const confirmImport = () => {
    if (!importPreview) return
    replaceData(importPreview.data)
    setImportPreview(null)
    setMsg("تم استيراد البيانات بنجاح")
  }

  return (
    <div>
      <h2 className="page-title">الإعدادات</h2>

      {msg && <div className="alert alert-success mb-4">{msg}</div>}

      <div className="card mb-4">
        <h3 className="section-title"><Palette size={18} /> الهوية البصرية</h3>
        <div className="form-group">
          <label>اسم العيادة</label>
          <input
            className="input"
            value={settings.clinicName}
            onChange={e => updateSettings({ clinicName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>الشعار</label>
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="logo" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }} />
            ) : (
              <div className="logo-placeholder" style={{ width: 56, height: 56 }}>ع</div>
            )}
            <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
              <Image size={16} /> اختيار شعار
              <input type="file" accept="image/*" hidden onChange={handleLogo} />
            </label>
            {settings.logo && (
              <button className="btn btn-ghost" onClick={() => updateSettings({ logo: "" })}>إزالة</button>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>اللون الرئيسي</label>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={e => updateSettings({ primaryColor: e.target.value })}
            style={{ width: 60, height: 40, border: "none", cursor: "pointer", background: "transparent" }}
          />
        </div>
        <div className="form-group">
          <label>لون الخلفية (اختياري)</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.backgroundColor || (settings.theme === "dark" ? "#0F172A" : "#F8FAFC")}
              onChange={e => updateSettings({ backgroundColor: e.target.value })}
              style={{ width: 60, height: 40, border: "none", cursor: "pointer", background: "transparent" }}
            />
            <button className="btn btn-ghost" onClick={() => updateSettings({ backgroundColor: "" })}>
              إعادة الافتراضي
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>الوضع</label>
          <div className="flex gap-2">
            {(["light", "dark", "auto"] as const).map(t => (
              <button
                key={t}
                className={`btn ${settings.theme === t ? "btn-primary" : "btn-secondary"}`}
                onClick={() => updateSettings({ theme: t })}
              >
                {t === "light" ? "فاتح" : t === "dark" ? "داكن" : "تلقائي"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="section-title">أسعار افتراضية</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>سعر الكشف</label>
            <input
              className="input"
              type="number"
              value={settings.defaultFee}
              onChange={e => updateSettings({ defaultFee: Number(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>سعر الإعادة</label>
            <input
              className="input"
              type="number"
              value={settings.defaultRevisitFee}
              onChange={e => updateSettings({ defaultRevisitFee: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="section-title">طباعة تذكرة الدور</h3>
        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!settings.autoPrintTicket}
              onChange={e => updateSettings({ autoPrintTicket: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            طباعة تلقائية للتذكرة بعد تسجيل الدخول
          </label>
          <p className="text-sm text-muted mt-2">
            عند التفعيل يتم فتح نافذة الطباعة مباشرة بعد حفظ دخول المريض. مناسب للطابعات الحرارية 58مم و80مم والطابعات العادية.
          </p>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="section-title">النسخ الاحتياطي (JSON)</h3>
        <p className="text-muted text-sm mb-4">
          صدّر نسخة كاملة لحماية بياناتك، أو استورد نسخة سابقة عند الحاجة.
        </p>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={18} /> تصدير JSON
          </button>
          <button className="btn btn-secondary" onClick={handleImport}>
            <Upload size={18} /> استيراد JSON
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="section-title"><FolderCog size={18} /> النسخ الاحتياطي التلقائي اليومي</h3>
        <p className="text-muted text-sm mb-4">
          اختر مجلدًا على جهازك، ويقوم البرنامج تلقائيًا بحفظ نسخة كاملة من كل بياناتك فيه مرة كل يوم.
          يحذف البرنامج تلقائيًا النسخ الأقدم من 14 يومًا، لكنه يتوقف عن الحذف إن قلّ عدد النسخ المتبقية عن 5 — حماية إضافية تحافظ دائمًا على 5 نسخ على الأقل مهما كان عمرها.
        </p>

        {!backupAvailable ? (
          <p className="text-muted text-sm">هذه الميزة متاحة فقط في نسخة سطح المكتب.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="text-sm text-muted">المجلد الحالي</div>
                <div className="font-bold" style={{ wordBreak: "break-all" }}>
                  {settings.backupFolder || "لم يتم التحديد بعد"}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleChooseBackupFolder}>
                <FolderCog size={16} /> {settings.backupFolder ? "تغيير المجلد" : "اختيار مجلد"}
              </button>
            </div>
            {settings.backupFolder && (
              <p className="text-sm text-muted">
                عدد النسخ المحفوظة حاليًا في هذا المجلد: <strong>{folderBackupCount ?? "..."}</strong>
              </p>
            )}
          </>
        )}
      </div>

      <div className="card mb-4">
        <h3 className="section-title"><ShieldCheck size={18} /> الترخيص</h3>
        {!license.available ? (
          <p className="text-muted text-sm">التفعيل متاح فقط في نسخة سطح المكتب.</p>
        ) : license.loading || !license.status ? (
          <p className="text-muted text-sm">جارِ التحقق...</p>
        ) : license.status.activated ? (
          <div className="alert alert-success">
            البرنامج مُفعَّل — {license.status.licenseType === "permanent" ? "ترخيص دائم" : "ترخيص سنوي"}
            {license.status.expiresAt && ` (حتى ${new Date(license.status.expiresAt).toLocaleDateString("ar-EG")})`}
          </div>
        ) : (
          <ActivationForm />
        )}
      </div>

      {importPreview && (
        <div className="modal-overlay" onClick={() => setImportPreview(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>مراجعة النسخة الاحتياطية</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setImportPreview(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-4">راجع بيانات النسخة قبل الاستبدال. سيتم استبدال جميع البيانات الحالية.</p>
              <div className="queue-list">
                <div className="queue-item"><div style={{ flex: 1 }}>اسم العيادة</div><strong>{importPreview.clinicName}</strong></div>
                <div className="queue-item"><div style={{ flex: 1 }}>إصدار البرنامج</div><strong>{importPreview.version}</strong></div>
                <div className="queue-item"><div style={{ flex: 1 }}>تاريخ/وقت الإنشاء</div><strong>{importPreview.exportedAt}</strong></div>
                <div className="queue-item"><div style={{ flex: 1 }}>عدد المرضى</div><strong>{importPreview.patientsCount}</strong></div>
                <div className="queue-item"><div style={{ flex: 1 }}>عدد الزيارات</div><strong>{importPreview.visitsCount}</strong></div>
                <div className="queue-item"><div style={{ flex: 1 }}>الزيارات الملغاة</div><strong>{importPreview.cancelledCount}</strong></div>
                <div className="queue-item"><div style={{ flex: 1 }}>إصدار قاعدة البيانات</div><strong>{String(importPreview.schemaVersion)}</strong></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setImportPreview(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={confirmImport}>تأكيد الاستيراد واستبدال البيانات</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}