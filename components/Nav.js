import { profile } from "@/lib/content"

export default function Nav() {
  return (
    <nav>
      <div className="wrap nav-inner">
        <span className="nav-brand">
          <span className="p">{profile.brand}</span>:~$
        </span>
        <div className="nav-links">
          <a href="#projects">projects</a>
          <a href="#experience">experience</a>
          <a href="#skills">skills</a>
          <a href="#contact">contact</a>
        </div>
      </div>
    </nav>
  )
}
