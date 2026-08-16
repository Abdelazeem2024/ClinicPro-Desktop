import { useState } from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"

const WHATSAPP = "010 37235921"
const FACEBOOK_DISPLAY = "facebook.com/share/1LqfnjBUex"
const FACEBOOK_LINK = "https://www.facebook.com/share/1LqfnjBUex/"

function CopyRow({ icon, value, copyValue, brandColor }: { icon: ReactNode; value: string; copyValue: string; brandColor: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(copyValue) } catch { /* noop */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "var(--bg-elevated)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)", padding: "9px 10px", marginBottom: 9
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", background: brandColor
      }}>{icon}</span>
      <span style={{
        flex: 1, minWidth: 0, fontFamily: "monospace", fontSize: 11.5,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr"
      }}>{value}</span>
      <button
        onClick={handleCopy}
        style={{
          flexShrink: 0, border: "none", borderRadius: 8, padding: "6px 10px",
          fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer",
          background: copied ? "linear-gradient(135deg, #C8961F, #E9C25E)" : "linear-gradient(135deg, #1E7FD1, #4FCBFF)"
        }}
      >
        {copied ? "تم ✓" : "نسخ"}
      </button>
    </div>
  )
}

export default function DevCredit() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <a
        href="https://wa.me/201037235921"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          borderRadius: 999, padding: "7px 10px", marginBottom: 4,
          textDecoration: "none", fontSize: 12
        }}
      >
        <span style={{
          width: 20, height: 20, borderRadius: "50%", background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <svg viewBox="0 0 24 24" width={11} height={11} fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.44 1.32 4.94L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.51 2 12.05 2Zm5.8 14.02c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98s.73-2.11.99-2.4c.26-.28.56-.35.75-.35h.53c.17 0 .4-.03.62.47.24.55.79 1.9.86 2.04.07.14.11.3.02.49-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.29.28-.12.55.17.28.75 1.24 1.62 2 1.11.99 2.05 1.3 2.33 1.44.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.62.76 1.9.9.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" /></svg>
        </span>
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-main)", direction: "ltr" }}>
          010 37235921
        </span>
      </a>

      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "6px 12px", borderRadius: 999, width: "100%"
        }}
      >
        <span className="dev-credit-shimmer">
          Developed by <strong>Raqnova</strong>
        </span>
      </button>

      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{
            position: "fixed", inset: 0, background: "rgba(5,10,8,.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, zIndex: 200
          }}
        >
          <div className="card" style={{ maxWidth: 300, width: "100%", position: "relative", textAlign: "center", marginBottom: 0, padding: "22px 18px 18px" }}>
            <button
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="btn btn-ghost btn-icon"
              style={{ position: "absolute", top: 10, left: 10, width: 26, height: 26, padding: 0 }}
            >
              <X size={14} />
            </button>

            <div style={{
              width: 46, height: 46, margin: "0 auto 8px", borderRadius: 13,
              background: "linear-gradient(145deg, #1E7FD1, #4FCBFF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 20
            }}>R</div>
            <p style={{
              fontWeight: 800, fontSize: 17, margin: 0,
              background: "linear-gradient(95deg, #2596DC, #57D2FF)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent"
            }}>Raqnova</p>
            <p className="text-muted" style={{ margin: "2px 0 18px", fontSize: 11 }}>Smart Software Solutions</p>

            <CopyRow
              icon={<svg viewBox="0 0 24 24" width={14} height={14} fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.44 1.32 4.94L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.51 2 12.05 2Zm5.8 14.02c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98s.73-2.11.99-2.4c.26-.28.56-.35.75-.35h.53c.17 0 .4-.03.62.47.24.55.79 1.9.86 2.04.07.14.11.3.02.49-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.29.28-.12.55.17.28.75 1.24 1.62 2 1.11.99 2.05 1.3 2.33 1.44.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.62.76 1.9.9.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" /></svg>}
              value={WHATSAPP}
              copyValue={WHATSAPP.replace(/\s/g, "")}
              brandColor="#25D366"
            />

            <CopyRow
              icon={<svg viewBox="0 0 24 24" width={14} height={14} fill="#fff"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" /></svg>}
              value={FACEBOOK_DISPLAY}
              copyValue={FACEBOOK_LINK}
              brandColor="#1877F2"
            />
          </div>
        </div>
      )}
    </>
  )
}
