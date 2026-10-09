import { cookies } from "next/headers"
import FinanzasLogin from "@/components/FinanzasLogin"
import FinanzasDashboard from "@/components/FinanzasDashboard"
import { SESSION_COOKIE, sessionValid, authConfigured } from "@/lib/finanzas-auth"
import { getResumen } from "@/lib/finanzas"

export const dynamic = "force-dynamic"

// Private page: not linked anywhere, not in the sitemap, not indexed.
export const metadata = {
  title: "Finanzas",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export default async function FinanzasPage() {
  const token = cookies().get(SESSION_COOKIE)?.value

  if (!sessionValid(token)) {
    return (
      <main className="fz">
        <div className="wrap">
          <FinanzasLogin configured={authConfigured()} />
        </div>
      </main>
    )
  }

  const { data, error } = await getResumen()
  return (
    <main className="fz">
      <div className="wrap">
        <FinanzasDashboard data={data} error={error} />
      </div>
    </main>
  )
}
