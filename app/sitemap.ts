import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://flortasistani.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/generate`, lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE_URL}/how-it-works`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/pricing`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/blog`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE_URL}/sign-in`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE_URL}/sign-up`, lastModified: now, priority: 0.5, changeFrequency: "yearly" },
  ];

  const posts = await getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  return [...staticRoutes, ...blogRoutes];
}
