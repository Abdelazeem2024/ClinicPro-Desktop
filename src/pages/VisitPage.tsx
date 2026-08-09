import { useState } from "react"
import { UserPlus, Search, Check } from "lucide-react"
import { useApp } from "../context/AppContext"
import type { Patient, VisitType, VisitStatus } from "../types"
import { STATUS_LABELS } from "../types"
import { printQueueTicket } from "../utils/printTicket"

export default function VisitPage() {
  const { patients, addPatient, addVisit, settings, todayVisits, updateVisit, cancelVisit, findPatients } = useApp()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Patient | null>(null)
  const [type, setType] = useState<VisitType>("كشف")
  const [fee, setFee] = useState(settings.defaultFee)
  const [paid, setPaid] = useState(settings.defaultFee)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [lastVisit, setLastVisit] = useState<{ queueNumber: number; patientName: string; remaining: number } | null>(null)
  const [cancelTarget, setCancelTarget] = useState<{ id: string; name: string; queue: number } | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const suggestions = query.trim() ? findPatients(query) : []

  const handleSelect = (p: Patient) => {
    setSelected(p)
    setQuery(p.name)
    setFee(type === "كشف" ? settings.defaultFee : settings.defaultRevisitFee)
    setPaid(type === "كشف" ? settings.defaultFee : settings.defaultRevisitFee)
  }

  const handleTypeChange = (t: VisitType) => {
    setType(t)
    const f = t === "كشف" ? settings.defaultFee : settings.defaultRevisitFee
    setFee(f)
    setPaid(f)
  }

  const handleSubmit = (shouldPrint = false) => {
    if (!selected) return
    const visit = addVisit({
      patientId: selected.id,
      patientName: selected.name,
      type,
      fee: Number(fee) || 0,
      paid: Number(paid) || 0,
      status: "waiting"
    })
    // عدد المنتظرين قبله (الذين رقمهم أقل وحالتهم منتظر أو داخل الكشف)
    const waitingBefore = todayVisits.filter(
      v => (v.status === "waiting" || v.status === "inside") && v.queueNumber < visit.queueNumber
    ).length
    const remaining = Math.max(0, waitingBefore)

    if (shouldPrint || settings.autoPrintTicket) {
      printQueueTicket({
        clinicName: settings.clinicName || "العيادة",
        queueNumber: visit.queueNumber,
        remaining: remaining,
        message: "يرجى الانتظار حتى يتم النداء"
      })
    }

    setLastVisit({ ...visit, remaining })
    setSelected(null)
    setQuery("")
    setType("كشف")
    setFee(settings.defaultFee)
    setPaid(settings.defaultFee)
  }

  const handleQuickNew = () => {
    if (!newName.trim()) return
    const p = addPatient({ name: newName.trim(), phone: newPhone, address: "", age: "", gender: "", notes: "" })
    setSelected(p)
    setQuery(p.name)
    setShowNew(false)
    setNewName("")
    setNewPhone("")
  }

  const changeStatus = (id: string, status: VisitStatus) => {
    updateVisit(id, { status })
  }

  return (
    <div>
      <h2 className="page-title">دخول مريض / الطابور</h2>

      <div className="card mb-4">
        <h3 className="section-title">تسجيل دخول</h3>
        <div className="form-group">
          <label>البحث عن المريض</label>
          <div className="search-box" style={{ maxWidth: "100%" }}>
            <Search size={16} className="search-icon" />
            <input
              className="input"
              style={{ paddingRight: 42 }}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
              placeholder="اكتب اسم المريض..."
            />
          </div>
          {suggestions.length > 0 && !selected && (
            <div style={{ marginTop: 8, border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              {suggestions.slice(0, 6).map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm text-muted">{p.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!selected && (
          <button className="btn btn-secondary" onClick={() => setShowNew(true)}>
            <UserPlus size={16} /> مريض جديد سريع
          </button>
        )}

        {showNew && (
          <div className="mt-4" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="الاسم" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="input" style={{ flex: 1, minWidth: 120 }} placeholder="الهاتف" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            <button className="btn btn-primary" onClick={handleQuickNew}>حفظ واختيار</button>
          </div>
        )}

        {selected && (
          <div className="mt-4">
            <div className="alert alert-success mb-4">تم اختيار: {selected.name}</div>
            <div className="grid-2">
              <div className="form-group">
                <label>نوع الزيارة</label>
                <div className="flex gap-2">
                  <button className={`btn ${type === "كشف" ? "btn-primary" : "btn-secondary"}`} onClick={() => handleTypeChange("كشف")}>كشف</button>
                  <button className={`btn ${type === "إعادة" ? "btn-primary" : "btn-secondary"}`} onClick={() => handleTypeChange("إعادة")}>إعادة</button>
                </div>
              </div>
              <div className="form-group">
                <label>قيمة الكشف</label>
                <input className="input" type="number" value={fee} onChange={e => setFee(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>المدفوع</label>
                <input className="input" type="number" value={paid} onChange={e => setPaid(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>المتبقي</label>
                <input className="input" value={Math.max(0, fee - paid)} disabled />
              </div>
            </div>
            <div className="flex gap-2 mt-4" style={{ flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={() => handleSubmit(false)}>
                <Check size={18} /> تسجيل الدخول للطابور
              </button>
              <button className="btn btn-success btn-lg" onClick={() => handleSubmit(true)}>
                تسجيل + طباعة تذكرة الدور
              </button>
            </div>
          </div>
        )}
      </div>

      {lastVisit && (
        <div className="card mb-4" style={{ borderColor: "var(--primary)", borderWidth: 2 }}>
          <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="font-bold" style={{ fontSize: 16 }}>
                تم تسجيل: {lastVisit.patientName}
              </div>
              <div className="text-sm text-muted">
                رقم الدور: <strong style={{ fontSize: 22, color: "var(--primary)" }}>{lastVisit.queueNumber}</strong>
                {" "}• المتبقي: {lastVisit.remaining}
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => printQueueTicket({
                clinicName: settings.clinicName || "العيادة",
                queueNumber: lastVisit.queueNumber,
                remaining: lastVisit.remaining,
                message: "يرجى الانتظار حتى يتم النداء"
              })}
            >
              طباعة تذكرة الدور
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="section-title">طابور اليوم ({todayVisits.filter(v => v.status !== "cancelled").length})</h3>
        <div className="queue-list">
          {todayVisits.filter(v => v.status !== "cancelled").length === 0 ? (
            <div className="empty-state"><p>الطابور فارغ</p></div>
          ) : (
            todayVisits.filter(v => v.status !== "cancelled").map(v => (
              <div key={v.id} className="queue-item">
                <div className="queue-num">{v.queueNumber}</div>
                <div style={{ flex: 1 }}>
                  <div className="font-bold">{v.patientName}</div>
                  <div className="text-sm text-muted">{v.type} • {v.time} • مدفوع {v.paid} ج</div>
                </div>
                <select
                  className="select"
                  style={{ width: 130 }}
                  value={v.status}
                  onChange={e => changeStatus(v.id, e.target.value as VisitStatus)}
                >
                  {(Object.keys(STATUS_LABELS) as VisitStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button
                  className="btn btn-secondary btn-icon"
                  title="طباعة تذكرة الدور"
                  onClick={() => {
                    const before = todayVisits.filter(
                      x => (x.status === "waiting" || x.status === "inside") && x.queueNumber < v.queueNumber
                    ).length
                    printQueueTicket({
                      clinicName: settings.clinicName || "العيادة",
                      queueNumber: v.queueNumber,
                      remaining: before,
                      message: "يرجى الانتظار حتى يتم النداء"
                    })
                  }}
                >
                  🖨️
                </button>
                {v.status !== "cancelled" && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: "8px 12px", fontSize: 12 }}
                    title="إلغاء الكشف"
                    onClick={() => { setCancelReason(""); setCancelTarget({ id: v.id, name: v.patientName, queue: v.queueNumber }) }}
                  >
                    إلغاء الكشف
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إلغاء الكشف</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setCancelTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="mb-4">
                سيتم إلغاء كشف المريض <strong>{cancelTarget.name}</strong> (دور رقم {cancelTarget.queue}).
              </p>
              <p className="text-sm text-muted mb-4">
                لن يُحسب ضمن الكشوفات أو الإيرادات، ولن يُحذف السجل، ولن يُعاد استخدام رقم الدور.
              </p>
              <div className="form-group">
                <label>سبب الإلغاء (اختياري)</label>
                <input
                  className="input"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="مثال: غادر قبل الكشف"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setCancelTarget(null); setCancelReason("") }}>
                رجوع
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  cancelVisit(cancelTarget.id, cancelReason.trim() || undefined)
                  setCancelTarget(null)
                  setCancelReason("")
                }}
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}