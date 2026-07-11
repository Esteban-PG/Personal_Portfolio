import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import RagebaitGame from "@/components/RagebaitGame"
import { profile } from "@/lib/content"

export const metadata = {
  title: "Ragebait — play in the browser",
  description:
    "Ragebait, a trap platformer running on a custom C++17 / SDL2 / Lua engine, compiled to WebAssembly and played right in your browser.",
}

export default function RagebaitPage() {
  const { itch } = profile.links

  return (
    <>
      <Nav />
      <main>
        <section id="ragebait">
          <div className="wrap">
            <div className="sec-head">
              <span>
                <span className="prompt">➜ ~</span>{" "}
                <span className="cmd">./ragebait --play</span>
              </span>
            </div>

            <p className="game-mobile-note">
              ⌨ best on desktop — the game needs a keyboard (A / D + Space).
            </p>

            <div className="game-shell">
              <RagebaitGame />
            </div>

            <div className="game-notes">
              <div className="out">
                <span className="k">controls:</span>{" "}
                <span className="v">
                  A / D or ← / → move · W / Space jump · ESC pause
                </span>
              </div>
              <div className="out">
                <span className="k">engine:</span>{" "}
                <span className="v">
                  custom C++17 / SDL2 / Lua (ECS) → WebAssembly via Emscripten
                </span>
              </div>
              <div className="out">
                <span className="k">note:</span>{" "}
                <span className="v">
                  progress saves in your browser · click the game first to give
                  it keyboard focus
                </span>
              </div>
              {itch && (
                <div className="out">
                  <span className="k">also on:</span>{" "}
                  <a href={itch} target="_blank" rel="noopener noreferrer">
                    itch.io →
                  </a>
                </div>
              )}
              <div className="out">
                <span className="k">back:</span>{" "}
                <a href="/">cd ~/portfolio →</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
