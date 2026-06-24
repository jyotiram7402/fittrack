import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/privacy", "/terms", "/medical-disclaimer"],
        disallow: ["/dashboard", "/diet", "/workout", "/progress", "/plan", "/settings", "/admin", "/onboarding"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
