"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import ImageWarmer from "@/components/ImageWarmer";
import type { GalleryGroup } from "@/lib/gallery";

/* 摄影图集区块:CSS 多列瀑布流(缩略图保持原始比例),
   点击任意图打开全组灯箱,左右键跨组连看。
   缩略图走 next/image:按设备下发小尺寸 WebP,原图流量只在灯箱花;
   空闲/悬停时预热灯箱大图(ImageWarmer),点击秒开。 */

type Group = GalleryGroup;

export default function GalleryGrid({ groups }: { groups: Group[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  /* 各组在"扁平大列表"里的起始偏移,灯箱靠它跨组定位(纯计算,方便编译器优化) */
  const totals = groups.map((g) => g.photos.length);
  const sections = groups.map((g, i) => ({
    ...g,
    start: totals.slice(0, i).reduce((a, b) => a + b, 0),
  }));
  const flat = groups.flatMap((g) => g.photos);

  return (
    <>
      {sections.map((g) => (
        <section key={g.name} className="mt-8 first:mt-0">
          <h2 className="mb-4 w-fit -skew-x-6 bg-foreground px-3 py-0.5 text-sm font-bold font-brand italic text-background">
            <span className="inline-block skew-x-6">
              {g.name} <span className="opacity-80">{g.photos.length}</span>
            </span>
          </h2>
          <div className="columns-2 gap-3 md:columns-3">
            {g.photos.map((p, i) => {
              const isPriority = g.start + i < 4; // 首屏 4 张高优先
              return (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => setIndex(g.start + i)}
                  onMouseEnter={() => setHovered(p.src)}
                  onFocus={() => setHovered(p.src)}
                  aria-label={`查看 ${p.caption}`}
                  className="mb-3 block w-full cursor-zoom-in break-inside-avoid border-2 border-foreground bg-surface shadow-[4px_4px_0_0_var(--shadow)] transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {/* SVG 是矢量不需要优化,直接原样加载;位图走优化管线;
                      priority 与 lazy 互斥,高优先图交给 priority 自动 eager */}
                  <Image
                    src={p.src}
                    alt={p.caption}
                    width={p.width}
                    height={p.height}
                    sizes="(max-width: 768px) 50vw, 320px"
                    loading={isPriority ? undefined : "lazy"}
                    priority={isPriority}
                    unoptimized={p.src.endsWith(".svg")}
                    className="block h-auto w-full"
                  />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <Lightbox
        photos={flat}
        index={index}
        onClose={() => setIndex(null)}
        onNavigate={setIndex}
      />
      <ImageWarmer photos={flat} hovered={hovered} />
    </>
  );
}
