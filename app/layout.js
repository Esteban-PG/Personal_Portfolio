import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { siteUrl } from "@/lib/content"
import "./globals.css"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
})

const title = "Esteban — Software · Data · QA"
const description =
  "Portfolio of Esteban, a Computer Science graduate (Software Engineering emphasis) from Costa Rica. Projects in C++/Lua game engines, Python automation, SQL and data analysis."

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Esteban — Portfolio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
