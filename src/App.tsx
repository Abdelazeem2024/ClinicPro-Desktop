import { useState } from "react"
import {
  LayoutDashboard, Users, UserPlus, Settings,
  Moon, Sun, Search, FileText
} from "lucide-react"
import { useApp } from "./context/AppContext"
import Dashboard from "./pages/Dashboard"
import PatientsPage from "./pages/PatientsPage"
import VisitPage from "./pages/VisitPage"
import ReportsPage from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import { APP_VERSION } from "./types"

type Page = "dashboard" | "patients" | "visit" | "reports" | "settings"

export default function App() {
  const { settings, isDark, updateSettings } = useApp()
  const [page, setPage] = useState<Page>("dashboard")
  const [globalSearch, setGlobalSearch] = useState("")

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? "light" : "dark" })
  }

  const navItems = [
    { id: "dashboard" as Page, label: "الرئيسية", icon: <LayoutDashboard size={18} /> },
    { id: "patients" as Page, label: "المرضى", icon: <Users size={18} /> },
    { id: "visit" as Page, label: "دخول مريض", icon: <UserPlus size={18} /> },
    { id: "reports" as Page, label: "التقارير", icon: <FileText size={18} /> },
    { id: "settings" as Page, label: "الإعدادات", icon: <Settings size={18} /> },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          {settings.logo ? (
            <img src={settings.logo} alt="logo" />
          ) : (
            <div className="logo-placeholder">
              {settings.clinicName?.charAt(0) || "ع"}
            </div>
          )}
          <h1>{settings.clinicName || "Clinic Pro"}</h1>
        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="بحث سريع عن مريض..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && globalSearch.trim()) {
                setPage("patients")
              }
            }}
          />
        </div>

        <div className="topbar-actions">
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="تبديل الوضع">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => setPage("settings")} title="الإعدادات">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <nav style={{
          width: 200,
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border)",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flexShrink: 0
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`btn ${page === item.id ? "btn-primary" : "btn-ghost"}`}
              style={{ justifyContent: "flex-start", width: "100%" }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div className="text-sm text-muted" style={{ textAlign: "center", padding: 8 }}>
            Clinic Pro v{APP_VERSION}
          </div>
        </nav>

        <main className="main-content">
          {page === "dashboard" && <Dashboard onNavigate={setPage} />}
          {page === "patients" && <PatientsPage initialSearch={globalSearch} />}
          {page === "visit" && <VisitPage />}
          {page === "reports" && <ReportsPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}
