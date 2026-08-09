import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { LicenseStatus, ActivationResult } from "../types/electron"

interface LicenseContextType {
  status: LicenseStatus | null
  loading: boolean
  /** true إذا كنا خارج Electron (مثلاً npm run dev في المتصفح) — لا حظر إطلاقاً */
  available: boolean
  refresh: () => Promise<void>
  activate: (code: string) => Promise<ActivationResult>
}

const LicenseContext = createContext<LicenseContextType | null>(null)

// كل كم دقيقة نعيد التحقق تلقائياً أثناء تشغيل البرنامج (بالإضافة إلى عند الإقلاع)
const RECHECK_INTERVAL_MS = 5 * 60 * 1000

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const available = typeof window !== "undefined" && !!window.licenseAPI
  const [status, setStatus] = useState<LicenseStatus | null>(null)
  const [loading, setLoading] = useState(available)

  const refresh = useCallback(async () => {
    if (!window.licenseAPI) return
    try {
      const s = await window.licenseAPI.getStatus()
      setStatus(s)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!available) return
    refresh()
    const id = setInterval(refresh, RECHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [available, refresh])

  const activate = useCallback(async (code: string): Promise<ActivationResult> => {
    if (!window.licenseAPI) return { success: false, message: "غير متاح خارج نسخة سطح المكتب" }
    const res = await window.licenseAPI.activate(code)
    if (res.success) await refresh()
    return res
  }, [refresh])

  return (
    <LicenseContext.Provider value={{ status, loading, available, refresh, activate }}>
      {children}
    </LicenseContext.Provider>
  )
}

export function useLicense() {
  const ctx = useContext(LicenseContext)
  if (!ctx) throw new Error("useLicense must be used inside LicenseProvider")
  return ctx
}
