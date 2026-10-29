"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode, Ref } from "react";

const COVER_MS = 380;

type Props = {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
  onMouseMove?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
};

/* 统一站内导航:先用纱幕盖住当前页,再切路由,避免页面闪帧。
   reduced-motion / 修饰键点击(新标签页)退回普通 <Link> 行为。 */
const P3TransitionLink = forwardRef<HTMLAnchorElement, Props>(function P3TransitionLink(
  { href, className, style, children, onMouseMove, onMouseLeave },
  ref,
) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const self = e.currentTarget;
    if (window.matchMedia("(hover: none)").matches && self.querySelector(".p3-idle-text")) {
      self.classList.add("p3-touch-on");
    }

    e.preventDefault();
    window.dispatchEvent(new CustomEvent("p3:transition-start"));
    window.setTimeout(() => router.push(href), COVER_MS);
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </Link>
  );
});

export default P3TransitionLink;
