"use client"

import { useEffect, useRef, useState } from "react"

// Base path where the Emscripten build artifacts live (public/ragebait/*).
const BASE = "/ragebait"

export default function RagebaitGame() {
  const canvasRef = useRef(null)
  // 'loading' | 'ready' | 'missing'
  const [status, setStatus] = useState("loading")
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // --- Emscripten module config (mirrors web/shell.html of the game) ---
    // The generated index.js reads this pre-existing global on startup.
    window.Module = {
      canvas,
      // Resolve index.wasm / index.data under /ragebait/ regardless of the
      // page URL (the route is /ragebait, so relative paths would be wrong).
      locateFile: (path) => `${BASE}/${path}`,
      print: (text) => console.log("[ragebait]", text),
      printErr: (text) => console.error("[ragebait]", text),
      monitorRunDependencies: () => {},
      setStatus: (text) => {
        if (!text) {
          // Empty string = everything downloaded and the runtime is live.
          setStatus("ready")
          setProgress(null)
          canvas.focus()
          return
        }
        // Emscripten format: "Description (loaded/total)"
        const m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/)
        if (m) {
          setProgress(Math.round((parseFloat(m[2]) * 100) / parseFloat(m[4])))
        }
        setStatus("loading")
      },
    }

    // Keyboard needs focus on the canvas; grab it on any click.
    const focusCanvas = () => canvas.focus()
    // Browsers start the AudioContext suspended until the first interaction.
    const resumeAudio = () => {
      const ctx = window.Module?.SDL2?.audioContext
      if (ctx && ctx.state === "suspended") ctx.resume()
    }
    // Stop arrows / space from scrolling the page under the game.
    const preventScroll = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault()
      }
    }

    canvas.addEventListener("pointerdown", focusCanvas)
    window.addEventListener("keydown", preventScroll, false)
    const audioEvents = ["pointerdown", "keydown", "touchstart"]
    audioEvents.forEach((ev) => window.addEventListener(ev, resumeAudio, true))

    // Load the Emscripten loader once. Guarded so React StrictMode's
    // double-invoke in dev doesn't inject it twice.
    if (!document.getElementById("ragebait-loader")) {
      const script = document.createElement("script")
      script.id = "ragebait-loader"
      script.src = `${BASE}/index.js`
      script.async = true
      script.onerror = () => setStatus("missing")
      document.body.appendChild(script)
    }

    return () => {
      canvas.removeEventListener("pointerdown", focusCanvas)
      window.removeEventListener("keydown", preventScroll, false)
      audioEvents.forEach((ev) => window.removeEventListener(ev, resumeAudio, true))
    }
  }, [])

  return (
    <div className="game-frame">
      {/* Canvas stays visible from the start: the game measures its render
          scale from the canvas' CSS width at boot, so it must not be hidden. */}
      <canvas
        ref={canvasRef}
        id="canvas"
        tabIndex={-1}
        onContextMenu={(e) => e.preventDefault()}
      />

      {status === "loading" && (
        <div className="game-status">
          <span className="blink">booting engine…</span>
          {progress !== null && (
            <div className="game-progress">
              <span className="prompt">➜</span> loading assets {progress}%
            </div>
          )}
        </div>
      )}

      {status === "missing" && (
        <div className="game-status">
          <div>build not found.</div>
          <div className="game-progress">
            drop <b>index.js</b> · <b>index.wasm</b> · <b>index.data</b> into{" "}
            <b>public/ragebait/</b>
          </div>
        </div>
      )}
    </div>
  )
}
