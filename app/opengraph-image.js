import { ImageResponse } from "next/og"
import { profile } from "@/lib/content"

// Auto-detected by Next.js: this generated image becomes the Open Graph
// (and, by fallback, Twitter) preview for the site. Mirrors the terminal
// aesthetic of the home page instead of shipping a static asset.
export const alt = "Esteban — Software · QA · Data"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  const { name, role } = profile

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f13",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            border: "1px solid #26262e",
            borderRadius: "16px",
            background: "#16161c",
            boxShadow: "0 0 80px rgba(255, 180, 84, 0.12)",
            overflow: "hidden",
          }}
        >
          {/* title bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "20px 28px",
              borderBottom: "1px solid #26262e",
              background: "#1c1c24",
            }}
          >
            <div style={{ display: "flex", width: "16px", height: "16px", borderRadius: "50%", background: "#ff5f56" }} />
            <div style={{ display: "flex", width: "16px", height: "16px", borderRadius: "50%", background: "#ffbd2e" }} />
            <div style={{ display: "flex", width: "16px", height: "16px", borderRadius: "50%", background: "#27c93f" }} />
            <div style={{ display: "flex", marginLeft: "12px", color: "#6e6c64", fontSize: "24px" }}>
              esteban — zsh
            </div>
          </div>

          {/* body */}
          <div style={{ display: "flex", flexDirection: "column", padding: "56px 60px 64px" }}>
            <div style={{ display: "flex", color: "#9b998f", fontSize: "34px" }}>
              <span style={{ color: "#a3be8c" }}>$</span>
              <span style={{ marginLeft: "16px" }}>whoami</span>
            </div>
            <div
              style={{
                display: "flex",
                color: "#ffb454",
                fontSize: "104px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                marginTop: "20px",
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", color: "#edebe6", fontSize: "40px", marginTop: "16px" }}>
              {role}
            </div>
            <div style={{ display: "flex", color: "#7fb4ca", fontSize: "30px", marginTop: "40px" }}>
              Costa Rica · open to remote
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
