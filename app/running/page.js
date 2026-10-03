import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import RunningTracker from "@/components/RunningTracker"
import { getLogs } from "@/lib/running-store"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Running log",
  description:
    "Esteban's public running log: a progressive training plan with every session tracked by distance, time and pace.",
  alternates: { canonical: "/running" },
}

export default async function RunningPage() {
  const { logs, storageReady } = await getLogs()

  return (
    <>
      <Nav />
      <main>
        <section id="running">
          <div className="wrap">
            <a href="/" className="game-back">
              ← back to portfolio
            </a>
            <div className="sec-head">
              <span>
                <span className="prompt">➜ ~</span>{" "}
                <span className="cmd">./running --status</span>
              </span>
            </div>
            <RunningTracker initialLogs={logs} storageReady={storageReady} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
