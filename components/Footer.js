import { profile } from "@/lib/content"

export default function Footer() {
  const { github, linkedin, email } = profile.links

  return (
    <footer id="contact">
      <div className="wrap">
        <div className="foot-cmd">
          <span className="prompt">➜ ~</span>{" "}
          <span className="cmd">./contact.sh</span>
        </div>
        <h2>Let&apos;s build something.</h2>
        <p>
          I&apos;m looking for a junior role in software engineering, QA, or
          data where I can ship real things, write the tests that keep them
          working, and keep learning fast. If that sounds like your team,
          I&apos;d love to talk.
        </p>
        <a className="btn" href={`mailto:${email}`}>
          get in touch
        </a>
        <div className="foot-links">
          <a href={github} target="_blank" rel="noopener">
            github
          </a>
          <a href={linkedin} target="_blank" rel="noopener">
            linkedin
          </a>
          <a href={`mailto:${email}`}>email</a>
        </div>
        <div className="foot-note">
          © 2026 Esteban · built by hand, deployed on Vercel · exit 0
        </div>
      </div>
    </footer>
  )
}
