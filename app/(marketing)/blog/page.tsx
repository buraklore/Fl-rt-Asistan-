import Link from "next/link";
import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { getAllPosts, formatTurkishDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "İlişkiler, iletişim ve flört üzerine yazılar. Haftalık yeni yazı.",
};

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <MarketingNav />

      {/* Header */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-24">
        <p className="mb-4 font-display italic text-xl text-brand-400">
          okuma odası —
        </p>
        <h1 className="font-display text-display-sm leading-[0.95] tracking-tightest sm:text-display-md">
          Blog
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-200">
          İletişim, çekim, çatışma. Pratik yazılar, kısa okuma süresi.
        </p>
      </section>

      {/* Featured post — editorial hero card */}
      {featured && (
        <section className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href={`/blog/${featured.slug}`}
            className="group block overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 transition hover:border-brand-500/40"
          >
            <div className="grid gap-0 md:grid-cols-12">
              <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500/20 via-ink-900 to-ink-950 p-12 md:col-span-5 md:aspect-auto">
                <div className="pointer-events-none font-display text-9xl italic text-brand-500/30">
                  "
                </div>
                <div className="absolute left-6 top-6 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400 backdrop-blur">
                  Öne çıkan
                </div>
              </div>

              <div className="flex flex-col justify-center p-10 md:col-span-7">
                <div className="mb-3 flex items-center gap-3 text-xs text-ink-400">
                  <time>{formatTurkishDate(featured.date)}</time>
                  <span>·</span>
                  <span>{featured.readingMinutes} dk okuma</span>
                </div>
                <h2 className="mb-4 font-display text-3xl leading-tight transition group-hover:text-brand-400 sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mb-6 text-base leading-relaxed text-ink-300">
                  {featured.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-brand-400">
                  Yazıyı oku
                  <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Rest of posts — grid */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="divider mb-12" />
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="font-display text-2xl italic text-ink-400">
            Henüz yazı yok. Yakında.
          </p>
        </section>
      )}

      <MarketingFooter />
    </>
  );
}

function PostCard({
  post,
}: {
  post: Awaited<ReturnType<typeof getAllPosts>>[number];
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article>
        <div className="mb-3 flex items-center gap-3 text-xs text-ink-400">
          <time>{formatTurkishDate(post.date)}</time>
          <span>·</span>
          <span>{post.readingMinutes} dk</span>
        </div>
        <h3 className="mb-3 font-display text-2xl leading-tight transition group-hover:text-brand-400">
          {post.title}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-ink-300">
          {post.description}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink-700 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-ink-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
