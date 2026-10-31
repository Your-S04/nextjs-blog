"use client";

import { useEffect } from "react";

/* 全屏灯箱:受控组件(开闭与索引由父级管理),两个图片区块共用。
   Esc 关闭、←/→ 切换(循环)、点背景关闭、背景滚动锁定;
   背景固定暗底(与纱幕同理,任何主题下都不刺眼)。 */

export type LightboxPhoto = { src: string; caption?: string };

type Props = {
  photos: LightboxPhoto[];
  index: number | null; // null = 关闭
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const open = index !== null && photos.length > 0;
  const i = open && index !== null ? ((index % photos.length) + photos.length) % photos.length : 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(i - 1);
      if (e.key === "ArrowRight") onNavigate(i + 1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // 打开期间背景不滚动
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, i, onClose, onNavigate]);

  if (!open) return null;
  const photo = photos[i];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="图片查看"
      onClick={onClose}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 p-4"
      style={{ background: "rgba(5, 8, 16, 0.9)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 灯箱要按图片自然比例显示,next/image 需要预知尺寸 */}
      <img
        src={photo.src}
        alt={photo.caption ?? ""}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[78vh] max-w-[92vw] select-none object-contain shadow-[6px_6px_0_0_rgba(0,0,0,0.6)]"
      />
      {photo.caption && <p className="text-xs text-white/85">{photo.caption}</p>}
      {photos.length > 1 && (
        <p className="text-[10px] tracking-widest text-white/50">
          {i + 1} / {photos.length}
        </p>
      )}

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(i - 1);
            }}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/40 text-2xl leading-none text-white hover:bg-white/10"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(i + 1);
            }}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/40 text-2xl leading-none text-white hover:bg-white/10"
          >
            ›
          </button>
        </>
      )}

      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-white/40 text-lg leading-none text-white hover:bg-white/10"
      >
        ×
      </button>
    </div>
  );
}
