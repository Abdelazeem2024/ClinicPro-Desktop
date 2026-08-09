import type { ReactNode } from "react"
import { Lock } from "lucide-react"
import { useLicense } from "../context/LicenseContext"
import ActivationForm from "./ActivationForm"

/**
 * يلفّ كامل التطبيق. لا يمنع أبداً عرض شاشة التفعيل نفسها — البرنامج قد
 * يتوقف عن العمل (صفحات المرضى/الزيارات إلخ)، لكن زر "تفعيل" يبقى يعمل
 * دائمًا بغض النظر عن حالة الحظر، تماشيًا مع المطلوب.
 */
export default function LicenseGate({ children }: { children: ReactNode }) {
  const { status, loading, available } = useLicense()

  // خارج Electron (مثلاً npm run dev بالمتصفح) — لا حظر إطلاقاً، مفيد للتطوير
  if (!available) return <>{children}</>

  if (loading || !status) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p className="text-muted">جارِ التحقق من الترخيص...</p>
      </div>
    )
  }

  const blocked = !status.activated && status.trialExpired

  if (!blocked) {
    return (
      <>
        {!status.activated && status.trialDaysLeft !== null && status.trialDaysLeft !== undefined && (
          <TrialBanner daysLeft={status.trialDaysLeft} />
        )}
        {children}
      </>
    )
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", padding: 24, background: "var(--bg-main, #F8FAFC)"
    }}>
      <div className="card" style={{ maxWidth: 460, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Lock size={40} style={{ margin: "0 auto 12px", color: "var(--primary, #0A7CFF)" }} />
          <h2 className="page-title" style={{ marginBottom: 6 }}>
            {status.invalidStoredLicense ? "الترخيص غير صالح" : "انتهت الفترة التجريبية"}
          </h2>
          <p className="text-muted mb-4">
            {status.invalidStoredLicense
              ? (status.message || "الرجاء إدخال كود تفعيل صالح.")
              : "انتهت مدة التجربة المجانية (3 أيام). أدخل كود التفعيل لمتابعة استخدام البرنامج."}
          </p>
        </div>
        <ActivationForm />
      </div>
    </div>
  )
}

function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div style={{
      background: "#FEF3C7", color: "#B45309", padding: "8px 16px",
      textAlign: "center", fontSize: 13, fontWeight: 600
    }}>
      نسخة تجريبية — باقي {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"} قبل الحاجة للتفعيل. يمكنك التفعيل الآن من الإعدادات.
    </div>
  )
}
