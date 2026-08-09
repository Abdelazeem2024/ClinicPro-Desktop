import { useState } from "react"
import { Lock, Unlock, Eye, EyeOff } from "lucide-react"
import { useApp } from "../context/AppContext"
import { STATUS_LABELS } from "../types"

export default function ReportsPage() {
  const { visits, patients, settings, updateSettings } = useApp()
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [changeMode, setChangeMode] = useState(false)
  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [dateFrom, setDateFrom] = useState(() => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` })
  const [dateTo, setDateTo] = useState(() => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` })

  const handleUnlock = () => {
    if (password === settings.reportsPassword) {
      setUnlocked(true)
      setError("")
      setPassword("")
    } else {
      setError("كلمة المرور غير صحيحة")
    }
  }

  const handleChangePassword = () => {
    if (oldPass !== settings.reportsPassword) {
      setError("كلمة المرور القديمة غير صحيحة")
      return
    }
    if (newPass.length < 4) {
      setError("كلمة المرور الجديدة قصيرة جداً")
      return
    }
    if (newPass !== confirmPass) {
      setError("التأكيد غير متطابق")
      return
    }
    updateSettings({ reportsPassword: newPass })
    setChangeMode(false)
    setOldPass("")
    setNewPass("")
    setConfirmPass("")
    setError("")
    alert("تم تغيير كلمة المرور بنجاح")
  }

  if (!unlocked) {
    return (
      <div style={{ maxWidth: 400, margin: "60px auto" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <Lock size={40} style={{ margin: "0 auto 16px", color: "var(--primary)" }} />
          <h2 className="page-title">التقارير محمية</h2>
          <p className="text-muted mb-4">أدخل كلمة المرور للوصول إلى التقارير</p>
          <div className="form-group" style={{ position: "relative" }}>
            <input
              className="input"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUnlock()}
              placeholder="كلمة المرور"
              autoFocus
            />
            <button
              className="btn btn-ghost btn-icon"
              style={{ position: "absolute", left: 8, top: 8 }}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div className="alert alert-warning mb-4">{error}</div>}
          <button className="btn btn-primary btn-lg w-full" onClick={handleUnlock}>
            <Unlock size={18} /> فتح التقارير
          </button>
          <p className="text-sm text-muted mt-4">الافتراضي: 1234</p>
        </div>
      </div>
    )
  }

  const filtered = visits.filter(v => v.date >= dateFrom && v.date <= dateTo && v.status !== "cancelled")
  const exams = filtered.filter(v => v.type === "كشف").length
  const revisits = filtered.filter(v => v.type === "إعادة").length
  const revenue = filtered.reduce((s, v) => s + (v.paid || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}>التقارير</h2>
        <button className="btn btn-secondary" onClick={() => setChangeMode(!changeMode)}>
          تغيير كلمة المرور
        </button>
      </div>

      {changeMode && (
        <div className="card mb-4">
          <h3 className="section-title">تغيير كلمة مرور التقارير</h3>
          <div className="form-group">
            <label>القديمة</label>
            <input className="input" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
          </div>
          <div className="form-group">
            <label>الجديدة</label>
            <input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>
          <div className="form-group">
            <label>تأكيد الجديدة</label>
            <input className="input" type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
          </div>
          {error && <div className="alert alert-warning mb-4">{error}</div>}
          <button className="btn btn-primary" onClick={handleChangePassword}>حفظ</button>
        </div>
      )}

      <div className="card mb-4">
        <div className="flex gap-3 items-center" style={{ flexWrap: "wrap" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>من</label>
            <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>إلى</label>
            <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card" style={{ "--accent": "#0A7CFF" } as Record<string, string>}>
          <div className="label">عدد الكشوفات</div>
          <div className="value">{exams}</div>
        </div>
        <div className="stat-card" style={{ "--accent": "#8B5CF6" } as Record<string, string>}>
          <div className="label">عدد الإعادات</div>
          <div className="value">{revisits}</div>
        </div>
        <div className="stat-card" style={{ "--accent": "#10B981" } as Record<string, string>}>
          <div className="label">إجمالي الإيراد</div>
          <div className="value">{revenue} ج</div>
        </div>
        <div className="stat-card" style={{ "--accent": "#F59E0B" } as Record<string, string>}>
          <div className="label">إجمالي المرضى</div>
          <div className="value">{patients.length}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">تفاصيل الحركة</h3>
        <div className="queue-list">
          {filtered.length === 0 ? (
            <div className="empty-state"><p>لا توجد بيانات في الفترة المحددة</p></div>
          ) : (
            filtered.slice().reverse().map(v => (
              <div key={v.id} className="queue-item">
                <div style={{ flex: 1 }}>
                  <div className="font-bold">{v.patientName}</div>
                  <div className="text-sm text-muted">{v.date} • {v.time} • {v.type}</div>
                </div>
                <span className={`status-badge status-${v.status}`}>{STATUS_LABELS[v.status] || v.status}</span>
                <div className="font-bold">{v.paid} ج</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
