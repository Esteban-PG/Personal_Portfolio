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
        <div className="grid">
          {projects.map((project) => (
            <article className="card" key={project.slug}>
              <span className="card-path">
                ~/projects/<b>{project.slug}</b>
              </span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="chips">
                {project.chips.map((chip) => (
                  <span className="chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
              <div className="card-links">
                <a href={project.link.href} target="_blank" rel="noopener">
                  {project.link.label}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
