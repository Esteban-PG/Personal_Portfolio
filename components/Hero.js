"use client"

import { useEffect, useState } from "react"
import { profile } from "@/lib/content"

const CMD_1 = "whoami"
const CMD_2 = "ls ./links"

export default function Hero() {
  const [typed1, setTyped1] = useState("")
  const [typed2, setTyped2] = useState("")
  const [cur1, setCur1] = useState(true) // blinking cursor on line 1
  const [cur2, setCur2] = useState(false) // blinking cursor on line 2
  const [showOut1, setShowOut1] = useState(false) // whoami output
  const [showLine2, setShowLine2] = useState(false) // second prompt line
  const [showOut2, setShowOut2] = useState(false) // links output

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Reduced motion: skip the animation, reveal everything at once.
    if (reduce) {
      setTyped1(CMD_1)
      setTyped2(CMD_2)
      setCur1(false)
      setCur2(true)
      setShowOut1(true)
      setShowLine2(true)
      setShowOut2(true)
      return
    }

    let cancelled = false
    const timers = []
    const wait = (ms) =>
      new Promise((resolve) => timers.push(setTimeout(resolve, ms)))

    const type = async (text, setter) => {
      for (let i = 0; i <= text.length; i++) {
        if (cancelled) return
        setter(text.slice(0, i))
        await wait(55 + Math.random() * 60)
      }
    }

    const run = async () => {
      await wait(400)
      if (cancelled) return
      await type(CMD_1, setTyped1)
      if (cancelled) return
      setCur1(false)
      setShowOut1(true)
      await wait(500)
      if (cancelled) return
      setShowLine2(true)
      setCur2(true)
      await type(CMD_2, setTyped2)
      if (cancelled) return
      setShowOut2(true)
    }

    run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  const { name, role, meta, links, cv } = profile

  return (
    <header>
      <div className="wrap">
        <div className="term">
          <div className="term-bar">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="term-title">esteban — zsh — 80×24</span>
          </div>
          <div className="term-body">
            <div>
              <span className="prompt">➜ ~</span>{" "}
              <span className="cmd">{typed1}</span>
              {cur1 && <span className="cursor"></span>}
            </div>

            {showOut1 && (
              <div>
                <div className="hero-name">{name}</div>
                <div className="hero-role">{role}</div>
                {meta.map((line) => (
                  <div className="out" key={line.key}>
                    <span className="k">{line.key}</span>{" "}
                    <span className="v">{line.value}</span>
                  </div>
                ))}
                {cv && (
                  <div className="out">
                    <span className="k">cv:</span>{" "}
                    <a href={cv} download="Esteban_Chaves_Obando_CV.pdf">
                      download résumé ↓
                    </a>
                  </div>
                )}
              </div>
            )}

            {showLine2 && (
              <div style={{ marginTop: "14px" }}>
                <span className="prompt">➜ ~</span>{" "}
                <span className="cmd">{typed2}</span>
                {cur2 && <span className="cursor"></span>}
              </div>
            )}

            {showOut2 && (
              <div className="term-links">
                <a href={links.github} target="_blank" rel="noopener">
                  github
                </a>
                <a href={links.linkedin} target="_blank" rel="noopener">
                  linkedin
                </a>
                <a href={`mailto:${links.email}`}>email</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
