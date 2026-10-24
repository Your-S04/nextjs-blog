"use client";

import { useEffect, useState } from "react";

type Hits = { total: number; today: number };

/* 访客统计:请求本站 /api/visits(计数存 Turso 云库,真实跨访客)。
   接口不可达时整块隐藏。 */
export default function VisitorCounter() {
  const [hits, setHits] = useState<Hits | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/visits", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Hits>;
      })
      .then((d) => {
        if (alive && typeof d.total === "number") setHits(d);
      })
      .catch(() => {
        if (alive) setHits(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!hits) return null; // 接口不可达时整块隐藏,不占版面

  return (
    <section
      id="visitor-stats"
      className="mt-10 border-t border-border pt-4 text-xs text-faint"
    >
      <div className="flex items-center justify-between gap-2">
        <span>累计访客 {hits.total} · 今日 {hits.today}</span>
        <span>计数存于 Turso 云库</span>
      </div>
    </section>
  );
}
