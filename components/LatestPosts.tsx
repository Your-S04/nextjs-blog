import type { CSSProperties } from "react";
import { getAllPosts } from "@/lib/posts";
import P3PostBar from "./P3PostBar";
import P3TransitionLink from "./P3TransitionLink";

export default function LatestPosts({ count = 5 }: { count?: number }) {
  const latest = getAllPosts().slice(0, count);

  if (latest.length === 0) return <p className="text-faint">空</p>;

  return (
    <section>
      <h1 className="p3-in mb-6 w-fit -skew-x-6 bg-foreground px-4 py-1 text-2xl font-bold font-brand italic text-background shadow-[4px_4px_0_0_var(--shadow)]">
        <span className="inline-block skew-x-6">
          Latest Posts<span className="text-background">.</span>
        </span>
      </h1>
      <ul className="space-y-3">
        {latest.map((post, index) => (
          <li
            key={post.slug}
            className="p3-in"
            style={{ "--d": `${Math.min(index * 60, 240)}ms` } as CSSProperties}
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

      <div className="mt-6 text-center">
        <P3TransitionLink
          href="/posts"
          className="group relative inline-block -skew-x-6 bg-accent px-3 py-1 text-sm font-bold text-background transition-colors duration-150 hover:bg-background hover:text-foreground"
        >
          <span
            aria-hidden
            className="absolute inset-0 -z-10 skew-x-6 translate-x-[3px] translate-y-[3px] bg-[var(--shadow)] opacity-0 transition-opacity duration-100 group-hover:opacity-100"
          />
          <span className="inline-block skew-x-6">ALL →</span>
        </P3TransitionLink>
      </div>

    </section>
  );
}
