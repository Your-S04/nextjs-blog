"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "reveal";

/* 转场纱幕(挂在本区共享 layout,实例跨页面存活):
   - P3TransitionLink 派发 "p3:transition-start" → 进入 cover(覆盖全屏)
   - 路径变化(新页面就绪)→ 进入 reveal(向左收合,揭示新页)
   - 2.5s 兜底:导航失败等异常也会解除覆盖,不会卡死在覆盖态 */
export default function P3Veil() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const prevPathRef = useRef(pathname);

  const set = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  /* 转场请求(P3TransitionLink 派发) */
  useEffect(() => {
    const onStart = () => {
      if (phaseRef.current !== "idle") return; // 进行中,忽略重复请求
      set("cover");
      window.setTimeout(() => {
        if (phaseRef.current === "cover") set("reveal");
      }, 2500);
    };
    window.addEventListener("p3:transition-start", onStart);
    return () => window.removeEventListener("p3:transition-start", onStart);
  }, []);

  /* 路径变化 = 新页面已渲染 → 揭示 */
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    if (phaseRef.current === "cover") {
      const t = window.setTimeout(() => set("reveal"), 60); // 等新页首帧绘制
      return () => window.clearTimeout(t);
    }
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
