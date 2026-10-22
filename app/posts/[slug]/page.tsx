import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getAllPosts, getPost } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
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
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{meta.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <time>{meta.date}</time>
          {meta.tags.length > 0 && (
            <span className="flex gap-2">
              {meta.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tags/${encodeURIComponent(t)}`}
                  className="text-xs bg-gray-100 rounded-full px-2 py-0.5 hover:bg-gray-200"
                >
                  #{t}
                </Link>
              ))}
            </span>
          )}
        </div>
      </header>

      <div className="space-y-4 leading-relaxed [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-gray-900 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <div className="mt-10 border-t border-gray-100 pt-4">
        <Link href="/posts" className="text-sm text-blue-600 hover:underline">
          ← 全部文章
        </Link>
      </div>
    </article>
  );
}
