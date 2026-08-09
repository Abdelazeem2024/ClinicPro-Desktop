import { useState, useEffect } from "react"
import { UserPlus, Search, AlertCircle, Pencil } from "lucide-react"
import { useApp } from "../context/AppContext"
import type { Patient } from "../types"

type PatientForm = {
  name: string
  phone: string
  address: string
  age: number | ""
  gender: "ذكر" | "أنثى" | ""
  notes: string
}

const EMPTY_FORM: PatientForm = { name: "", phone: "", address: "", age: "", gender: "", notes: "" }

export default function PatientsPage({ initialSearch = "" }: { initialSearch?: string }) {
  const { patients, addPatient, updatePatient, findPatients } = useApp()
  const [search, setSearch] = useState(initialSearch)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PatientForm>(EMPTY_FORM)
  const [duplicate, setDuplicate] = useState<Patient | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => { setSearch(initialSearch) }, [initialSearch])

  const filtered = search.trim() ? findPatients(search) : patients.slice().reverse()

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name }))
    if (!editingId && name.trim().length > 2) {
      const found = findPatients(name)
      setDuplicate(found.find(p => p.name.toLowerCase() === name.toLowerCase()) || null)
    } else setDuplicate(null)
  }

  const openNewForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDuplicate(null)
    setShowForm(true)
  }

  const openEditForm = (p: Patient) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      phone: p.phone,
      address: p.address,
      age: p.age,
      gender: p.gender,
      notes: p.notes
    })
    setDuplicate(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDuplicate(null)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      phone: form.phone,
      address: form.address,
      age: form.age === "" ? ("" as const) : Number(form.age),
      gender: form.gender,
      notes: form.notes
    }
    if (editingId) {
      updatePatient(editingId, payload)
    } else {
      addPatient(payload)
    }
    closeForm()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}>المرضى ({patients.length})</h2>
        <button className="btn btn-primary" onClick={openNewForm}>
          <UserPlus size={18} /> مريض جديد
        </button>
      </div>

      <div className="search-box mb-4" style={{ maxWidth: "100%" }}>
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="ابحث بالاسم أو الهاتف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 className="section-title">{editingId ? "تعديل بيانات المريض" : "تسجيل مريض جديد"}</h3>
          {duplicate && (
            <div className="alert alert-warning mb-4">
              <AlertCircle size={16} style={{ display: "inline", marginLeft: 6 }} />
              المريض مسجل بالفعل: {duplicate.name} - {duplicate.phone}
            </div>
          )}
          <div className="grid-2">
            <div className="form-group">
              <label>الاسم *</label>
              <input className="input" value={form.name} onChange={e => handleNameChange(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label>رقم الهاتف</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>العمر</label>
              <input className="input" type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value === "" ? "" : Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>النوع</label>
              <select className="select" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as any }))}>
                <option value="">--</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>ملاحظات</label>
            <textarea className="textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-lg" onClick={handleSave}>{editingId ? "حفظ التعديلات" : "حفظ"}</button>
            <button className="btn btn-secondary" onClick={closeForm}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="queue-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>لا يوجد مرضى</p></div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="queue-item">
              <div style={{ flex: 1 }}>
                <div className="font-bold">{p.name}</div>
                <div className="text-sm text-muted">{p.phone || "—"} {p.age ? `• ${p.age} سنة` : ""} {p.gender ? `• ${p.gender}` : ""}</div>
              </div>
              <button
                className="btn btn-secondary btn-icon"
                title="تعديل بيانات المريض"
                onClick={() => openEditForm(p)}
              >
                <Pencil size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
