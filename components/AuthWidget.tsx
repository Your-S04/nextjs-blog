"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* Header 右上角的登录状态小组件:
   未登录 → 登录/注册 链接;已登录 → 用户名 + 退出 */
export default function AuthWidget() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUsername(d.user?.username ?? null))
      .catch(() => setUsername(null));
    setMounted(true);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUsername(null);
    router.refresh();
  };

  if (!mounted) return <div className="h-5 w-16" />; // 占位防布局跳动

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
