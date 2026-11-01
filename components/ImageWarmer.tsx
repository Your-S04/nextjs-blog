"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { LightboxPhoto } from "@/components/Lightbox";

/* 灯箱大图预热:页面空闲时先暖前几张,鼠标悬停缩略图再暖对应那张。
   用与灯箱完全相同的 sizes 参数 → 命中同一个优化缓存,点击时零等待。
   SVG 是矢量无需预热。 */

const LIGHTBOX_SIZES = "(max-width: 768px) 100vw, 90vw";

export default function ImageWarmer({
  photos,
  initial = 6,
  hovered,
}: {
  photos: LightboxPhoto[];
  initial?: number;
  hovered?: string | null;
}) {
  const [idleWarmed, setIdleWarmed] = useState<string[]>([]);

  /* 页面空闲后暖前 initial 张(Safari 没有 requestIdleCallback,退回 setTimeout) */
  useEffect(() => {
    const cb = () => setIdleWarmed(photos.slice(0, initial).map((p) => p.src));
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(cb);
      return;
    }
    const t = window.setTimeout(cb, 800);
    return () => window.clearTimeout(t);
  }, [photos, initial]);

  const wanted = new Set<string>([...idleWarmed, ...(hovered ? [hovered] : [])]);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-hidden opacity-0">
      {photos
        .filter((p) => wanted.has(p.src))
        .map((p) => (
          <Image
            key={p.src}
            src={p.src}
            alt=""
            width={p.width}
            height={p.height}
            sizes={LIGHTBOX_SIZES}
            unoptimized={p.src.endsWith(".svg")}
          />
        ))}
    </div>
  );
}
