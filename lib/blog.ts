import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  tags: string[];
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

/**
 * Read all blog posts, sorted newest-first. Runs at build time on
 * the server — no client-side fs access.
 */
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const files = await fs.readdir(CONTENT_DIR).catch(() => [] as string[]);
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));

  const posts = await Promise.all(
    mdxFiles.map(async (filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(CONTENT_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        date: String(data.date ?? new Date().toISOString().slice(0, 10)),
        readingMinutes: estimateReadingMinutes(content),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      } satisfies BlogPostMeta;
    }),
  );

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const raw = await fs.readFile(filePath, "utf-8").catch(() => null);
  if (!raw) return null;

  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? new Date().toISOString().slice(0, 10)),
    readingMinutes: estimateReadingMinutes(content),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    content,
  };
}

/** ~220 words per minute is standard for mobile reading. */
function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Format "YYYY-MM-DD" as "15 Nisan 2026" for Turkish readers. */
export function formatTurkishDate(iso: string): string {
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
