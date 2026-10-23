"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "covered" | "reveal";

const COVER_MS = 380;

/* 转场纱幕(挂在本区共享 layout,实例跨页面存活),三阶段状态机:
   1. cover   圆从右缘扩张吞屏(0.38s)
   2. covered 满屏后锚点瞬间换到左缘(切换不可见)
   3. reveal  从左缘收合,揭示新页(0.45s)
   触发:P3TransitionLink 派发 "p3:transition-start";揭示在新页就绪
   (路径变化)后开始,但至少等 cover 动画播完;2.5s 兜底防卡死。
   揭示期间给 <html> 挂 p3-arriving,驱动条目入场动画(错峰)。 */
export default function P3Veil() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const coverStartRef = useRef(0);
  const prevPathRef = useRef(pathname);

  const set = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const toCovered = () => {
    set("covered");
    /* 双 rAF 确保覆盖态先绘制,再切 reveal 过渡 */
    requestAnimationFrame(() => requestAnimationFrame(() => set("reveal")));
  };

  /* 转场请求(P3TransitionLink 派发) */
  useEffect(() => {
    const onStart = () => {
      if (phaseRef.current !== "idle") return; // 进行中,忽略重复请求
      coverStartRef.current = performance.now();
      set("cover");
      window.setTimeout(() => {
        if (phaseRef.current === "cover") toCovered(); // 2.5s 兜底
      }, 2500);
    };
    window.addEventListener("p3:transition-start", onStart);
    return () => window.removeEventListener("p3:transition-start", onStart);
  }, []);

  /* 路径变化 = 新页面已渲染 → 等 cover 播完后,择机覆盖+揭示 */
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    if (phaseRef.current !== "cover") return;
    const elapsed = performance.now() - coverStartRef.current;
    const t = window.setTimeout(
      toCovered,
      Math.max(0, COVER_MS - elapsed),
    );
    return () => window.clearTimeout(t);
  }, [pathname]);

  /* 揭示动画(0.45s)结束后归位;揭示期间给 <html> 挂 p3-arriving,
     驱动条目入场动画(错峰),结束(0.8s 后)摘除 → 基础态可见,永不隐身 */
  useEffect(() => {
    if (phase !== "reveal") return;
    document.documentElement.classList.add("p3-arriving");
    const t = window.setTimeout(() => {
      document.documentElement.classList.remove("p3-arriving");
      set("idle");
    }, 800);
    return () => window.clearTimeout(t);
  }, [phase]);

  return <div aria-hidden data-phase={phase} className="p3-veil" />;
}
