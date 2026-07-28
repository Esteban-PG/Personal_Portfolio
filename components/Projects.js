import { projects } from "@/lib/content"

export default function Projects() {
  return (
    <section id="projects">
      <div className="wrap">
        <div className="sec-head">
          <span>
            <span className="prompt">➜ ~</span>{" "}
            <span className="cmd">ls ~/projects</span>
          </span>
        </div>
        {projects.length === 0 && (
          <p className="projects-empty">
            # work in progress — new projects coming soon
          </p>
        )}
        <div className="grid">
          {projects.map((project) => {
            // The first link becomes the whole-card click target (stretched
            // link); any remaining links stay clickable on top of it.
            const [primary, ...rest] = project.links ?? []
            return (
              <article
                className={`card${primary ? " card-clickable" : ""}`}
                key={project.slug}
              >
                <div className="card-top">
                  <span className="card-path">
                    ~/projects/<b>{project.slug}</b>
                  </span>
                  {project.status && (
                    <span className="card-status">
                      <i className="status-dot" aria-hidden="true" />
                      {project.status}
                    </span>
                  )}
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.highlights?.length > 0 && (
                  <ul className="card-highlights">
                    {project.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                )}
                <div className="chips">
                  {project.chips.map((chip) => (
                    <span className="chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
                {project.links?.length > 0 && (
                  <div className="card-links">
                    {primary && (
                      <a
                        href={primary.href}
                        className="card-link-stretched"
                        {...(primary.internal
                          ? {}
                          : { target: "_blank", rel: "noopener" })}
                      >
                        {primary.label}
                      </a>
                    )}
                    {rest.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="card-link-top"
                        {...(link.internal
                          ? {}
                          : { target: "_blank", rel: "noopener" })}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
