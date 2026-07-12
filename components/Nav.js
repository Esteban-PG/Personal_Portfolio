"use client"

import { useEffect, useState } from "react"
import { profile } from "@/lib/content"

const links = [
  { id: "projects", label: "projects" },
  { id: "experience", label: "experience" },
  { id: "skills", label: "skills" },
  { id: "contact", label: "contact" },
]

export default function Nav() {
  const [active, setActive] = useState("")

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter(Boolean)
    if (sections.length === 0) return

    // Activation band sits around ~45–50% down the viewport: a section is
    // "active" once it crosses the middle of the screen while scrolling.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <nav>
      <div className="wrap nav-inner">
        <span className="nav-brand">
          <span className="p">{profile.brand}</span>:~$
        </span>
        <div className="nav-links">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? "active" : undefined}
              aria-current={active === link.id ? "true" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
