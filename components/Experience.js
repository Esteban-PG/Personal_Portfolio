import { experience } from "@/lib/content"

export default function Experience() {
  return (
    <section id="experience">
      <div className="wrap">
        <div className="sec-head">
          <span>
            <span className="prompt">➜ ~</span>{" "}
            <span className="cmd">cat experience.log</span>
          </span>
        </div>
        <div className="xp">
          {experience.map((item) => (
            <div className="xp-item" key={item.role}>
              <div className="xp-role">{item.role}</div>
              <div className="xp-meta">{item.meta}</div>
              <ul>
                {item.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
