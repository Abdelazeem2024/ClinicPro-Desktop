import { useState } from "react"
import { Copy, Check, KeyRound } from "lucide-react"
import { useLicense } from "../context/LicenseContext"

export default function ActivationForm({ onActivated }: { onActivated?: () => void }) {
  const { status, activate } = useLicense()
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const machineId = status?.machineId || ""

  const handleCopy = async () => {
    if (!machineId) return
    if (window.licenseAPI) await window.licenseAPI.copyMachineId(machineId)
    else await navigator.clipboard?.writeText(machineId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleActivate = async () => {
    if (!code.trim() || busy) return
    setBusy(true)
    setError("")
    try {
      const res = await activate(code)
      if (res.success) {
        setCode("")
        onActivated?.()
      } else {
        setError(res.message || "كود التفعيل غير صحيح")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="form-group">
        <label>معرّف الجهاز (أرسله لمزوّد البرنامج للحصول على كود التفعيل)</label>
        <div className="flex gap-2">
          <input className="input" value={machineId} readOnly style={{ fontFamily: "monospace", letterSpacing: 1 }} />
          <button className="btn btn-secondary btn-icon" onClick={handleCopy} title="نسخ معرّف الجهاز">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>كود التفعيل</label>
        <input
          className="input"
          style={{ fontFamily: "monospace" }}
          placeholder="الصق كود التفعيل هنا"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleActivate()}
          autoFocus
        />
      </div>

      {error && <div className="alert alert-warning mb-4">{error}</div>}

      <button className="btn btn-primary btn-lg w-full" onClick={handleActivate} disabled={busy || !code.trim()}>
        <KeyRound size={18} /> {busy ? "جارِ التحقق..." : "تفعيل البرنامج"}
      </button>
    </div>
  )
}
