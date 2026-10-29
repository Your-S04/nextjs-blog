import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getAllPosts, getPost } from "@/lib/posts";
import LikeButton from "@/components/LikeButton";
import Comments from "@/components/Comments";
import P3TransitionLink from "@/components/P3TransitionLink";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getPost(slug);
    return { title: meta.title };
  } catch {
    return { title: "文章不存在" };
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  let post: ReturnType<typeof getPost>;
  try {
    post = getPost(slug);
  } catch {
    notFound();
  }
  const { meta, content } = post;

  return (
    <article>
      <header className="mb-8">
        <h1 className="w-fit max-w-full -skew-x-6 bg-foreground px-4 py-2 text-2xl font-bold font-brand italic leading-snug text-background shadow-[5px_5px_0_0_var(--shadow)]">
          <span className="inline-block skew-x-6">{meta.title}</span>
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <time className="font-semibold">{meta.date}</time>
          {meta.tags.length > 0 && (
            <span className="flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <P3TransitionLink
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="-skew-x-6 bg-accent px-2 py-0.5 text-xs font-bold text-background"
                >
                  <span className="inline-block skew-x-6">#{tag}</span>
                </P3TransitionLink>
              ))}
            </span>
          )}
        </div>
      </header>

      <div className="space-y-4 leading-relaxed [&_a]:font-semibold [&_a]:text-accent [&_a:hover]:text-accent-2 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:text-muted [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:font-brand [&_h2]:mt-8 [&_h2]:border-l-4 [&_h2]:border-accent-2 [&_h2]:pl-3 [&_h2]:font-brand [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-foreground [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:text-background">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <div className="mt-8 border-y-2 border-border py-4">
        <LikeButton slug={slug} />
      </div>
      <Comments slug={slug} />

      <div className="mt-8 text-center">
        <P3TransitionLink
          href="/posts"
          className="inline-block -skew-x-6 bg-accent px-3 py-1 text-sm font-bold text-background"
        >
          <span className="inline-block skew-x-6">ALL →</span>
        </P3TransitionLink>
      </div>
    </article>
  );
}
