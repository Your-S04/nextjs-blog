"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* 点赞按钮:乐观更新(先变状态再请求,失败回滚);未登录点击 → 引导去登录 */
export default function LikeButton({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    fetch(`/api/likes/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setCount(d.count ?? 0);
        setLiked(!!d.liked);
        if (d.liked) setLoggedIn(true);
      })
      .catch(() => setCount(0));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.user))
      .catch(() => {});
  }, [slug]);

  const toggle = async () => {
    if (count === null) return;
    /* 未登录(或登录态未确认):不乐观更新,直接引导登录,避免闪现成功态 */
    if (!loggedIn) {
      setNeedLogin(true);
      return;
    }
    const prev = { count, liked };
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));
    try {
      const r = await fetch(`/api/likes/${encodeURIComponent(slug)}`, {
        method: "POST",
      });
      if (r.status === 401) {
        /* 会话已在别处过期:回滚并引导登录 */
        setLoggedIn(false);
        setNeedLogin(true);
        setCount(prev.count);
        setLiked(prev.liked);
        return;
      }
      const d = await r.json();
      setCount(d.count);
      setLiked(d.liked);
    } catch {
      /* 网络失败回滚 */
      setCount(prev.count);
      setLiked(prev.liked);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className={`rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
          liked
            ? "bg-[#E60012] text-white"
            : "bg-foreground text-background hover:bg-accent hover:text-black"
        }`}
      >
        ♥ {count ?? 0}
      </button>
      {needLogin && (
        <span className="text-xs text-faint">
          登录后才能点赞 ·{" "}
          <Link href="/login" className="text-accent hover:underline">
            去登录
          </Link>
        </span>
      )}
    </div>
  );
}
