"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { applyTheme, getStoredTheme, THEMES, type ThemeId } from "@/lib/theme";

export default function ThemePicker() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>("system");
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = getStoredTheme();
    setCurrent(id);
    // 默认跟随系统:首访(未手动选过)也挂上实时监听
    if (id === "system") applyTheme("system");
    setMounted(true);
  }, []);

  // 点外面 / Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id: ThemeId) => {
    applyTheme(id);
    setCurrent(id);
    setOpen(false);
    /* 选 P3 主题 → 直达 P3 风格的 tag 页 */
    if (id === "p3") router.push("/tags");
  };

  const active = THEMES.find((t) => t.id === current) ?? THEMES[4];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="切换外观"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface hover:bg-surface-hover"
      >
        {/* 未挂载前用中性占位,避免水合不一致 */}
        <span
          className="h-4 w-4 rounded-full"
          style={
            mounted
              ? {
                  background: `conic-gradient(${active.swatch[0]} 0 120deg, ${active.swatch[1]} 120deg 240deg, ${active.swatch[2]} 240deg 360deg)`,
                }
              : undefined
          }
        />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border border-border bg-background p-1.5 shadow-xl">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={current === t.id}
              onClick={() => pick(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-surface-hover hover:text-accent ${
                current === t.id ? "text-accent" : "text-foreground"
              }`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{
                  background: `conic-gradient(${t.swatch[0]} 0 120deg, ${t.swatch[1]} 120deg 240deg, ${t.swatch[2]} 240deg 360deg)`,
                }}
                aria-hidden
              />
              <span className="flex-1 text-left">{t.label}</span>
              {current === t.id && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
