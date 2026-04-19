import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { getAllPosts, getPostBySlug, formatTurkishDate } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className="mb-6 mt-12 font-display text-4xl leading-tight sm:text-5xl"
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="mb-4 mt-12 font-display text-2xl leading-tight sm:text-3xl"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="mb-3 mt-8 font-display text-xl leading-tight sm:text-2xl"
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      {...props}
      className="mb-5 text-base leading-[1.7] text-ink-200 sm:text-lg"
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-brand-400 underline decoration-brand-500/30 underline-offset-4 hover:decoration-brand-500"
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="mb-5 space-y-2 pl-5 text-ink-200" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="mb-5 list-decimal space-y-2 pl-5 text-ink-200" />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="leading-relaxed marker:text-brand-400" />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="my-8 border-l-2 border-brand-500 pl-6 font-display text-xl italic leading-relaxed text-ink-100 sm:text-2xl"
    />
  ),
  hr: () => <hr className="my-12 border-ink-800" />,
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-sm text-brand-400"
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-ink-100" />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="font-display not-italic italic text-brand-400" />
  ),
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <MarketingNav />

      <article className="mx-auto max-w-2xl px-6 pb-16 pt-16 sm:pt-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-12 inline-block text-sm text-ink-400 transition hover:text-ink-200"
        >
          ← Tüm yazılar
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="mb-6 flex items-center gap-3 text-xs text-ink-400">
            <time>{formatTurkishDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingMinutes} dk okuma</span>
          </div>

          <h1 className="mb-6 font-display text-display-sm leading-[1.02] tracking-tightest sm:text-5xl md:text-6xl">
            {post.title}
          </h1>

          <p className="text-lg leading-relaxed text-ink-300 sm:text-xl">
            {post.description}
          </p>
        </header>

        <div className="divider mb-12" />

        {/* Body */}
        <div className="prose-none">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl border border-ink-800 bg-ink-900/40 p-8 text-center">
          <p className="mb-4 font-display text-2xl italic text-brand-400">
            Yazıda bahsedilen her şey için —
          </p>
          <p className="mb-6 text-base text-ink-200">
            Flört Asistanı, cevabı senin için yazıyor.
          </p>
          <Link
            href="/generate"
            className="inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
          >
            Ücretsiz dene →
          </Link>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <MarketingFooter />
    </>
  );
}
