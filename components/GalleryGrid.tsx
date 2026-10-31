"use client";

import { useState } from "react";
import Lightbox, { type LightboxPhoto } from "@/components/Lightbox";

/* 摄影图集区块:CSS 多列瀑布流(缩略图保持原始比例),
   点击任意图打开全组灯箱,左右键跨组连看。 */

type Group = { name: string; photos: LightboxPhoto[] };

export default function GalleryGrid({ groups }: { groups: Group[] }) {
  const [index, setIndex] = useState<number | null>(null);

  /* 各组在"扁平大列表"里的起始偏移,灯箱靠它跨组定位(纯计算,方便编译器优化) */
  const totals = groups.map((g) => g.photos.length);
  const sections = groups.map((g, i) => ({
    ...g,
    start: totals.slice(0, i).reduce((a, b) => a + b, 0),
  }));

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
            {g.photos.map((p, i) => (
              <button
                key={p.src}
                type="button"
                onClick={() => setIndex(g.start + i)}
                aria-label={`查看 ${p.caption}`}
                className="mb-3 block w-full cursor-zoom-in break-inside-avoid border-2 border-foreground bg-surface shadow-[4px_4px_0_0_var(--shadow)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 瀑布流依赖图片自然高度,next/image 需要预知尺寸 */}
                <img src={p.src} alt={p.caption} loading="lazy" className="block w-full" />
              </button>
            ))}
          </div>
        </section>
      ))}

      <Lightbox
        photos={groups.flatMap((g) => g.photos)}
        index={index}
        onClose={() => setIndex(null)}
        onNavigate={setIndex}
      />
    </>
  );
}
