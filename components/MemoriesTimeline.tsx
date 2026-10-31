"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import type { Memory } from "@/lib/memories";

/* 游戏记忆区块:竖向时间线 —— 左侧脊线 + 方块节点(P3 斜切语言),
   每条 = 日期 + 游戏胶囊 + 同行朋友 + 几句话 + 截图(点开灯箱)。 */

export default function MemoriesTimeline({ entries }: { entries: Memory[] }) {
  const [open, setOpen] = useState<{ id: string; index: number } | null>(null);
  const entry = open ? entries.find((e) => e.id === open.id) : undefined;

  return (
    <>
      <ol className="relative">
        {/* 脊线:贯穿全部条目 */}
        <div
          aria-hidden
          className="absolute bottom-2 left-[7px] top-2 w-[3px] bg-border"
        />
        {entries.map((m) => (
          <li key={m.id} className="relative pb-10 pl-8 last:pb-0">
            {/* 时间线节点 */}
            <span
              aria-hidden
              className="absolute left-0 top-1 h-[17px] w-[17px] -skew-x-6 border-2 border-foreground bg-accent"
            />

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <time className="font-brand text-sm font-bold italic">{m.date || "日期未填"}</time>
              {m.games.map((g) => (
                <span
                  key={g}
                  className="-skew-x-6 bg-accent px-2 py-0.5 text-[10px] font-bold text-background"
                >
                  <span className="inline-block skew-x-6">{g}</span>
                </span>
              ))}
              {m.friends.length > 0 && (
                <span className="text-xs text-faint">与 {m.friends.join("、")}</span>
              )}
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>

            {m.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {m.images.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => setOpen({ id: m.id, index: i })}
                    aria-label={`查看 ${img.caption}`}
                    className="cursor-zoom-in border-2 border-foreground shadow-[4px_4px_0_0_var(--shadow)] transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- 缩略图按原始比例缩放,next/image 需要预知尺寸 */}
                    <img
                      src={img.src}
                      alt={img.caption}
                      loading="lazy"
                      className="block h-28 w-auto"
                    />
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>

      <Lightbox
        photos={entry?.images ?? []}
        index={open && entry ? open.index : null}
        onClose={() => setOpen(null)}
        onNavigate={(index) => setOpen({ id: open!.id, index })}
      />
    </>
  );
}
