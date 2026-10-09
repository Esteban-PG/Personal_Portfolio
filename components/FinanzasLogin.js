"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function FinanzasLogin({ configured }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [sacude, setSacude] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/finanzas/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.error || "No se pudo entrar.")
        setSacude(true)
        setPassword("")
        return
      }
      router.refresh()
    } catch {
      setError("Sin conexión. Intenta de nuevo.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fz-login">
      <p className="fz-prompt">
        <span className="prompt">➜ ~</span> <span className="cmd">./finanzas --login</span>
      </p>
      {!configured && (
        <p className="fz-error">Falta configurar la clave en Vercel (FINANZAS_PASSWORD y FINANZAS_SESSION_SECRET).</p>
      )}
      <form
        onSubmit={submit}
        className={`fz-login-form ${sacude ? "fz-sacude" : ""}`}
        onAnimationEnd={() => setSacude(false)}
      >
        <label htmlFor="fz-pass">Clave</label>
        <input
          id="fz-pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          disabled={busy || !configured}
        />
        <button type="submit" disabled={busy || !password || !configured}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
      {error && <p className="fz-error">{error}</p>}
    </div>
  )
}
