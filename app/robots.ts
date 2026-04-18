import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/sign-in", "/sign-up", "/reset", "/api/"],
      },
    ],
    sitemap: "https://rizzai.app/sitemap.xml",
  };
}
