"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

const COVER_MS = 400;

/* P3 转场链接:点击 → 波点圆从右扩张覆盖全屏 → 跳转。
   新页面上的 <P3Veil /> 检测到标记后向左收合,把新页面带出来。 */
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
    const touch = window.matchMedia("(hover: none)").matches;
    const self = e.currentTarget;

    /* 触屏两段式:第一次点按只显示 hover 态(没有真实 hover 可用),
       第二次点按才播放转场。只对带 hover 视觉的 tag 条目生效。 */
    if (touch && self.querySelector(".p3-idle-text") && !self.classList.contains("p3-touch-on")) {
      e.preventDefault();
      self.classList.add("p3-touch-on");
      return;
    }

    /* reduced-motion 或转场进行中:退回普通导航 */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const veil = document.getElementById("p3-veil");
    if (!veil || veil.classList.contains("p3-veil-cover")) return;

    e.preventDefault();
    veil.classList.add("p3-veil-cover");
    setTimeout(() => {
      try {
        sessionStorage.setItem("p3-veil", "in");
      } catch {
        /* ignore */
      }
      router.push(href);
    }, COVER_MS);
  };

  return (
    <Link href={href} className={className} style={style} onClick={onClick}>
      {children}
    </Link>
  );
}
