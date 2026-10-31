"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* Header 右上角的登录状态小组件:
   未登录 → 登录/注册 链接;已登录 → 用户名 + 退出 */
export default function AuthWidget() {
  const router = useRouter();
  /* undefined = 登录态未确认(渲染占位,防水合不一致),null = 确认未登录 */
  const [username, setUsername] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUsername(d.user?.username ?? null))
      .catch(() => setUsername(null));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUsername(null);
    router.refresh();
  };

  if (username === undefined) return <div className="h-5 w-16" />; // 占位防布局跳动

  if (username) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-accent">{username}</span>
        <button
          type="button"
          onClick={logout}
          className="text-faint transition-colors hover:text-accent"
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <Link href="/login" className="text-faint transition-colors hover:text-accent">
        登录
      </Link>
      <Link href="/register" className="font-bold text-accent hover:underline">
        注册
      </Link>
    </div>
  );
}
