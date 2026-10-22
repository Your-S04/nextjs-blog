"use client";

import Link from "next/link";
import { useRef } from "react";

type Props = { href: string; index: number; title: string; date: string };

/* P3 文章横条:hover 时中间标题块上浮/斜切;
   红色硬影与鼠标相对条目中心的方向相反移动(光标即光源,影子背光)。 */
export default function P3PostBar({ href, index, title, date }: Props) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const row = rowRef.current;
    const bar = barRef.current;
    if (!row || !bar) return;
    const r = row.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2 || 1);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2 || 1);
    /* 块体小幅顺向移动(含悬浮提升 -4px),影子反方向大幅移动 → 视差 */
    bar.style.translate = `${(dx * 3).toFixed(1)}px ${(dy * 2 - 4).toFixed(1)}px`;
    bar.style.boxShadow = `${(-dx * 14).toFixed(1)}px ${(-dy * 10).toFixed(1)}px 0 0 #E60012`;
  };

  const onLeave = () => {
    if (barRef.current) {
      barRef.current.style.translate = "";
      barRef.current.style.boxShadow = "";
    }
  };

  return (
    <Link
      ref={rowRef}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group flex items-stretch"
    >
      {/* 编号块(不参与悬浮) */}
      <span className="flex w-11 items-center justify-center bg-foreground font-brand text-sm font-bold text-background transition-colors duration-150 group-hover:bg-[#00C8F0] group-hover:text-black">
        <span className="inline-block">{String(index + 1).padStart(2, "0")}</span>
      </span>
      {/* 标题条:hover 时只有这一块上浮 + 斜切 + 背光红影;文字保持与块互为对比色 */}
      <span
        ref={barRef}
        className="flex-1 bg-foreground px-4 py-2.5 font-medium text-background transition-[background-color,color,transform] duration-150 ease-out hover:skew-x-[-10deg]"
      >
        <span className="inline-block transition-transform duration-150 group-hover:skew-x-[10deg]">
          {title}
        </span>
      </span>
      {/* 日期条(不参与悬浮) */}
      <span className="flex items-center bg-[#00C8F0] px-2.5 text-xs font-bold text-black">
        <span className="inline-block">{date}</span>
      </span>
    </Link>
  );
}
