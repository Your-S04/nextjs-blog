"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* 登录/注册共用表单 */
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error ?? "出错了,请重试");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误,请重试");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full border-2 border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

  return (
    <form onSubmit={submit} className="mx-auto flex w-full flex-col gap-3 p-5">
      <h1 className="w-fit -skew-x-6 bg-foreground px-3 py-1 font-brand text-2xl font-bold italic text-background shadow-[3px_3px_0_0_var(--shadow)]">
        <span className="inline-block skew-x-6">{mode === "login" ? "Login" : "Register"}<span className="text-background">.</span></span>
      </h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="用户名(2-16 位)"
        autoComplete="username"
        maxLength={16}
        required
        className={input}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码(至少 6 位)"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        minLength={6}
        maxLength={72}
        required
        className={input}
      />
      {error && <p className="text-sm font-semibold text-danger">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="-skew-x-6 bg-foreground px-4 py-2 font-bold text-background transition-colors hover:bg-accent hover:text-background disabled:opacity-50"
      >
        {busy ? "请稍候…" : mode === "login" ? "登录" : "注册"}
      </button>
      <p className="text-xs text-faint">
        {mode === "login" ? (
          <>
            没有账号?
            <Link href="/register" className="text-accent hover:underline">
              去注册
            </Link>
          </>
        ) : (
          <>
            已有账号?
            <Link href="/login" className="text-accent hover:underline">
              去登录
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
