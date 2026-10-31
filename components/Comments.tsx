"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Comment = {
  id: number;
  username: string;
  content: string;
  createdAt: string;
};

/* 服务端统一存 UTC(SQLite datetime 的空格格式 / ISO 的 T 格式):
   按 UTC 解析后转浏览器本地时区显示,否则北京时间会慢 8 小时 */
function formatTime(utc: string): string {
  const iso = utc.includes("T") ? utc : `${utc.replace(" ", "T")}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return utc; // 解析失败原样兜底
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* 评论区:列表 + 发表框(需登录);纯文本渲染,防 XSS */
export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch(`/api/comments/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => setComments([]));
  };

  useEffect(() => {
    load();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUsername(d.user?.username ?? null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/comments/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error ?? "发送失败,请重试");
        return;
      }
      setContent("");
      load(); // 重新拉取列表
    } catch {
      setError("网络错误,请重试");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full border-2 border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

  return (
    <section id="comments" className="mt-10 border-t border-border pt-6">
      <h2 className="mb-4 w-fit -skew-x-6 bg-foreground px-3 py-0.5 text-lg font-bold font-brand italic text-background">
        <span className="inline-block skew-x-6">Comments<span className="text-background">.</span></span>
      </h2>

      {username ? (
        <form onSubmit={submit} className="mb-6 flex flex-col gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`以 ${username} 的身份评论(1-500 字)`}
            maxLength={500}
            rows={3}
            required
            className={input}
          />
          {error && <p className="text-sm font-semibold text-danger">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-faint">{content.length}/500</span>
            <button
              type="submit"
              disabled={busy || content.trim().length === 0}
              className="-skew-x-6 bg-foreground px-4 py-1.5 text-sm font-bold text-background transition-colors hover:bg-accent disabled:opacity-50"
            >
              <span className="inline-block skew-x-6">{busy ? "发送中…" : "发表评论"}</span>
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-faint">
          登录后才能评论 ·{" "}
          <Link href="/login" className="text-accent hover:underline">
            去登录
          </Link>
        </p>
      )}

      {comments === null ? null : comments.length === 0 ? (
        <p className="text-sm text-faint">还没有评论</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-border pb-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold">{c.username}</span>
                <time className="text-xs text-faint">{formatTime(c.createdAt)}</time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
