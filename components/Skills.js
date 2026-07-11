import { skills } from "@/lib/content"

export default function Skills() {
  return (
    <section id="skills">
      <div className="wrap">
        <div className="sec-head">
          <span>
            <span className="prompt">➜ ~</span>{" "}
            <span className="cmd">cat skills.toml</span>
          </span>
        </div>
        <div className="skills">
          {skills.map((skill) => (
            <div className="skill-group" key={skill.group}>
              <h4>{skill.group}</h4>
              <ul>
                {skill.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
