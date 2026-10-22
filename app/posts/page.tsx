import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ALL</h1>
      {posts.length === 0 ? (
        <p className="text-gray-400">空 </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.slug} className="border-b border-gray-100 pb-4">
              <Link
                href={`/posts/${p.slug}`}
                className="text-lg font-medium hover:text-blue-600"
              >
                {p.title}
              </Link>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                <time>{p.date}</time>
                {p.tags.length > 0 && (
                  <span className="flex gap-2">
                    {p.tags.map((t) => (
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
