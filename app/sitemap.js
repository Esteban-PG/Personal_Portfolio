import { siteUrl } from "@/lib/content"

export default function sitemap() {
  const lastModified = new Date()

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/ragebait`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/running`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ]
}
