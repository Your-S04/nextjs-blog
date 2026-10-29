import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import P3PostBar from "@/components/P3PostBar";

export const metadata: Metadata = { title: "文章" };

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="p3-in mb-6 w-fit -skew-x-6 bg-foreground px-4 py-1 text-2xl font-bold font-brand italic text-background shadow-[4px_4px_0_0_var(--shadow)]">
        <span className="inline-block skew-x-6">
          All Posts<span className="text-background">.</span>
        </span>
      </h1>
      {posts.length === 0 ? (
        <p className="text-faint">空</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post, index) => (
            <li
              key={post.slug}
              className="p3-in"
              style={{ "--d": `${Math.min(index * 60, 300)}ms` } as CSSProperties}
            >
              <P3PostBar
                href={`/posts/${post.slug}`}
                index={index}
                title={post.title}
                date={post.date}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
