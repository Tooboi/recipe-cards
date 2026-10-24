import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recipecardvault.com";

// Served at /robots.txt. Lets every crawler in, except pages that are private to each user.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/new-recipe", "/recipes/edit/", "/signin", "/signup"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
