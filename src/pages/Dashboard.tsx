import type { CSSProperties } from "react"
import { Users, Stethoscope, RotateCcw, Wallet, Clock, UserPlus, FileText, Settings } from "lucide-react"
import { useApp } from "../context/AppContext"
import { STATUS_LABELS } from "../types"

type Page = "dashboard" | "patients" | "visit" | "reports" | "settings"

interface Props {
  onNavigate: (p: Page) => void
}

export default function Dashboard({ onNavigate }: Props) {
  const { stats, todayVisits, settings } = useApp()

  const cards = [
    { label: "كشوفات اليوم", value: stats.exams, icon: <Stethoscope size={22} />, accent: "#0A7CFF" },
    { label: "إعادات اليوم", value: stats.revisits, icon: <RotateCcw size={22} />, accent: "#8B5CF6" },
    { label: "إيراد اليوم", value: stats.revenue + " ج.م", icon: <Wallet size={22} />, accent: "#10B981" },
    { label: "منتظرين", value: stats.waiting, icon: <Clock size={22} />, accent: "#F59E0B" },
  ]

  return (
    <div>
      <h2 className="page-title">مرحباً بك في {settings.clinicName}</h2>

      <div className="grid-stats">
        {cards.map((c, i) => (
          <div key={i} className="stat-card" style={{ ["--accent" as string]: c.accent } as CSSProperties}>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
            <div className="icon-wrap">{c.icon}</div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <button className="btn btn-primary btn-lg" onClick={() => onNavigate("visit")}>
          <UserPlus size={20} /> دخول مريض
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => onNavigate("patients")}>
          <Users size={20} /> المرضى
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => onNavigate("reports")}>
          <FileText size={20} /> التقارير
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => onNavigate("settings")}>
          <Settings size={20} /> الإعدادات
        </button>
      </div>

      <div className="card">
        <div className="section-title">
          <Clock size={18} /> مرضى اليوم ({todayVisits.filter(v => v.status !== "cancelled").length})
        </div>
        {todayVisits.length === 0 ? (
          <div className="empty-state">
            <p>لا يوجد مرضى اليوم بعد</p>
            <button className="btn btn-primary mt-4" onClick={() => onNavigate("visit")}>
              إضافة أول مريض
            </button>
          </div>
        ) : (
          <div className="queue-list">
            {todayVisits.filter(v => v.status !== "cancelled").slice(0, 12).map(v => (
              <div key={v.id} className="queue-item">
                <div className="queue-num">{v.queueNumber}</div>
                <div style={{ flex: 1 }}>
                  <div className="font-bold">{v.patientName}</div>
                  <div className="text-sm text-muted">{v.type} • {v.time}</div>
                </div>
                <span className={`status-badge status-${v.status}`}>{STATUS_LABELS[v.status] || v.status}</span>
                <div className="text-sm font-bold" style={{ minWidth: 60, textAlign: "left" }}>
                  {v.paid} ج
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
