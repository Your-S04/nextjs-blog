import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getAllTags } from "@/lib/posts";
import P3PostBar from "@/components/P3PostBar";
import P3TransitionLink from "@/components/P3TransitionLink";

type Props = { params: Promise<{ tag: string }> };

/* 只预渲染单标签;a+b 组合标签走按需动态渲染(路由不用动) */
export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${safeDecode(tag)}` };
}

/** Next 对 params 的解码行为在版本间有差异:统一做一次安全解码 */
function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default async function TagPage({ params }: Props) {
  const tag = safeDecode((await params).tag);

  /* 先拆分再校验:组合 tag("a+b")整体永远不会出现在单标签列表里 */
  const wanted = tag.split("+");
  if (wanted.some((t) => !getAllTags().includes(t))) notFound();

  const posts = getAllPosts().filter((p) =>
    wanted.every((t) => p.tags.includes(t)),
  );

  /* 可叠加的标签:当前结果集里出现过的其他 tag(点一下 = 追加筛选) */
  const related = [
    ...new Set(posts.flatMap((p) => p.tags)),
  ]
    .filter((t) => !wanted.includes(t))
    .sort();

  const comboHref = (tags: string[]) =>
    `/tags/${encodeURIComponent(tags.join("+"))}`;

  return (
    <div className="relative overflow-hidden">
      {/* 出血装饰大字(缓慢漂移) */}
      <span
        aria-hidden
        className="p3-drift pointer-events-none absolute -top-10 -right-4 select-none font-brand text-[6rem] font-bold italic leading-none tracking-tighter text-foreground/5"
      >
        #{wanted.join("+")}
      </span>

      <h1 className="relative z-10 mb-6 ml-1.5 w-fit -skew-x-6 bg-[#1B2FD8] px-4 py-1.5 font-brand text-2xl font-bold italic text-white p3-in">
        <span className="inline-block skew-x-6">#{wanted.join("+")}</span>
        <span className="ml-3 inline-block -skew-x-6 bg-[#E60012] px-2 py-0.5 text-xs font-bold">
          <span className="inline-block skew-x-6">{posts.length} POSTS</span>
        </span>
      </h1>

      {/* 方案 1 入口:当前筛选(可移除)+ 可叠加标签(点击追加) */}
      {(wanted.length > 1 || related.length > 0) && (
        <div className="relative ml-1.5 mt-4 flex flex-wrap items-center gap-2">
          {wanted.length > 1 &&
            wanted.map((t) => (
              <Link
                key={t}
                href={comboHref(wanted.filter((x) => x !== t))}
                className="-skew-x-6 bg-foreground px-2.5 py-1 text-xs font-bold text-background transition-colors hover:bg-[#E60012] hover:text-white"
              >
                <span className="inline-block skew-x-6">
                  {t} <span aria-hidden>✕</span>
                </span>
              </Link>
            ))}
          {wanted.length > 1 && related.length > 0 && (
            <span aria-hidden className="px-1 text-xs font-bold text-faint">
              +
            </span>
          )}
          {related.map((t) => (
            <Link
              key={t}
              href={comboHref([...wanted, t])}
              className="-skew-x-6 bg-[#00C8F0] px-2.5 py-1 text-xs font-bold text-black transition-colors hover:bg-[#E60012] hover:text-white"
            >
              <span className="inline-block skew-x-6">+ {t}</span>
            </Link>
          ))}
        </div>
      )}

      <ul className="relative mt-8 space-y-3 pb-2">
        {posts.map((p, i) => (
          <li key={p.slug} className="p3-in" style={{ animationDelay: `${Math.min(i * 70, 500)}ms` }}>
            <P3PostBar href={`/posts/${p.slug}`} index={i} title={p.title} date={p.date} />
          </li>
        ))}
      </ul>

      {/* 手柄提示位致敬 */}
      <div className="relative mt-10 flex justify-end">
        <P3TransitionLink
          href="/tags"
          className="rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground shadow-[0_0_0_2px_var(--border)] transition-colors hover:text-accent"
        >
          全部标签
        </P3TransitionLink>
      </div>
    </div>
  );
}
