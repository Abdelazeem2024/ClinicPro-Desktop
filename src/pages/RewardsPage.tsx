import { useState } from "react"
import { Gift, Copy, Check } from "lucide-react"

const TIERS = [
  { n: 1, label: "دعوة صديق واحد بنجاح", reward: "3 شهور تفعيل مجانًا" },
  { n: 2, label: "دعوة صديقين بنجاح", reward: "6 شهور تفعيل مجانًا" },
  { n: 3, label: "دعوة 3 أصدقاء بنجاح", reward: "سنة كاملة تفعيل مجانًا!" },
]

// ملاحظة: الكود ثابت هنا للعرض فقط لحين ربطه بنظام توليد أكواد حقيقي
// مرتبط برقم عميل داخلي فعلي. عند توفره، مرر الكود الفعلي كـ prop بدل
// هذه القيمة الثابتة.
const DEMO_CODE = "AGP-4827-XQ"

export default function RewardsPage({ inviteCode = DEMO_CODE }: { inviteCode?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
    } catch {
      /* بيئات نادرة بدون دعم Clipboard API */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{
          fontSize: 30, fontWeight: 800, margin: 0,
          display: "inline-flex", alignItems: "center", gap: 10
        }}>
          <span style={{
            width: 42, height: 42, borderRadius: 13,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(155deg, rgba(245,158,11,0.16), rgba(10,124,255,0.16))",
            border: "1px solid var(--border)"
          }}>
            <Gift size={20} color="var(--warning)" />
          </span>
          مكافآتي
        </h2>
        <p className="text-muted" style={{ marginTop: 8, fontSize: 14.5 }}>
          ادعُ أصدقاءك، واربح اشتراكًا مجانيًا!
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {TIERS.map(t => (
          <div key={t.n} className="card" style={{
            padding: "16px 8px 14px", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            marginBottom: 0
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 12.5,
              border: `2px solid ${t.n === 3 ? "var(--warning)" : "var(--primary)"}`,
              background: t.n === 3 ? "var(--warning)" : t.n === 2 ? "rgba(10,124,255,0.09)" : "transparent",
              color: t.n === 3 ? "#fff" : "var(--primary)"
            }}>{t.n}</span>
            <p className="text-muted" style={{ fontSize: 12, margin: 0, minHeight: 32 }}>{t.label}</p>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: "var(--warning)", margin: 0 }}>
              🎁 {t.reward}
            </p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>كود الدعوة الخاص بك</p>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-elevated)", border: "1.5px dashed var(--border)",
            borderRadius: "var(--radius-sm)", padding: "12px 10px",
            fontFamily: "monospace", fontWeight: 700, fontSize: 19, letterSpacing: 1.5, direction: "ltr"
          }}>
            {inviteCode}
          </div>
          <button className="btn btn-primary" onClick={handleCopy} style={{ minWidth: 90 }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "تم" : "نسخ"}
          </button>
        </div>
        <ul style={{ margin: "14px 0 0", padding: 0, borderTop: "1px dashed var(--border)", paddingTop: 12 }}>
          {[
            "يتم إنشاء كود الدعوة تلقائيًا بعد تفعيل البرنامج",
            "الكود فريد لكل عميل، ولا يُستخدم نفس الكود لعميلين",
            "الكود مرتبط بحساب العميل داخل النظام",
            "لا يتم احتساب الدعوات غير الحقيقية أو المكررة",
          ].map((line, i) => (
            <li key={i} className="text-muted" style={{
              listStyle: "none", fontSize: 12, display: "flex", gap: 7,
              alignItems: "flex-start", marginBottom: 6, lineHeight: 1.5
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", marginTop: 6, flexShrink: 0 }} />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-muted" style={{ textAlign: "center", fontSize: 13, margin: "22px 6px", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--text-main)" }}>كل دعوة ناجحة تقربك من مكافأة أكبر.</strong>
        <br />شارك كودك الآن وابدأ في جمع التفعيل المجاني.
      </p>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 16px" }} />

      <p className="text-muted" style={{ textAlign: "center", fontSize: 11, opacity: .85, lineHeight: 1.7 }}>
        تُحتسب الدعوة بعد تسجيل العميل الجديد وتفعيل البرنامج، ولا تُحتسب الدعوات الوهمية أو المكررة.
      </p>
    </div>
  )
}
