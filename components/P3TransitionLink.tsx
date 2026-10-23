"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

const COVER_MS = 380;

/* P3 转场链接:点击 → 派发 "p3:transition-start"(纱幕开始覆盖)
   → 覆盖完成后才 router.push(全屏已遮,跳转无闪帧)
   → 新页就绪后由 P3Veil 揭示。 */
export default function P3TransitionLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    /* reduced-motion:退回普通导航 */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const self = e.currentTarget;
    const touch = window.matchMedia("(hover: none)").matches;

    /* 触屏:点按瞬间强制 hover 视觉态(与覆盖动画同时可见) */
    if (touch && self.querySelector(".p3-idle-text")) {
      self.classList.add("p3-touch-on");
    }

    e.preventDefault();
    window.dispatchEvent(new CustomEvent("p3:transition-start"));
    window.setTimeout(() => router.push(href), COVER_MS);
  };

  return (
    <Link href={href} className={className} style={style} onClick={onClick}>
      {children}
    </Link>
  );
}
