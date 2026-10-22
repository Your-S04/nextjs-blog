"use client";

import { useEffect } from "react";

/* 转场纱幕:挂在 /tags 与 /tags/[tag] 两页。
   新页面挂载时若带着 "p3-veil = in" 标记,则先满屏覆盖,
   再让圆向左缘收合,把新页面从右向左带出来。 */
export default function P3Veil() {
  useEffect(() => {
    const veil = document.getElementById("p3-veil");
    if (!veil) return;
    let marked = false;
    try {
      marked = sessionStorage.getItem("p3-veil") === "in";
      sessionStorage.removeItem("p3-veil");
    } catch {
      return;
    }
    if (!marked) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* 覆盖态锚点在左缘(满屏)→ 双 rAF 确保首帧生效 → 向左收合揭示 */
    veil.classList.add("p3-veil-covered");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        veil.classList.remove("p3-veil-covered");
        veil.classList.add("p3-veil-reveal");
        setTimeout(() => veil.classList.remove("p3-veil-reveal"), 500);
      }),
    );
  }, []);

  return <div id="p3-veil" aria-hidden className="p3-veil" />;
}
