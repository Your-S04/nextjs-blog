import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getPostsGroupedByTag } from "@/lib/posts";
import { p3spec } from "@/lib/p3";
import P3TransitionLink from "@/components/P3TransitionLink";
import P3Veil from "@/components/P3Veil";

export const metadata: Metadata = {
  title: "标签",
};

/* 红色硬影的固定偏移:所有 tag 方向一致 */
const TRI_SHADOW = "translate(9px, 9px)";
/* Link 的上内边距(px) */
const PAD_TOP = 4;

/* 估算 text-5xl 粗斜体的文字宽度:CJK ≈ 46px,拉丁 ≈ 27px */
function estimateTextWidth(tag: string): number {
  return [...tag].reduce(
    (w, ch) => w + (ch.charCodeAt(0) > 255 ? 46 : 27),
    0,
  );
}

/* P3 实验样式(总览页 v2):左侧竖排 TAGS 主体 + 左白右蓝全页撞色分割
   (fixed,滚动时背景恒定);tag 列表靠左错落;三角左端点指向倾斜方向
   但带逐项偏移,整体向 TAGS 主体靠拢。 */
export default function TagsPage() {
  const groups = getPostsGroupedByTag();

  /* 超过 5 个 tag 分两列(上限两列):前一半进左列,后一半进右列 */
  const withIdx = groups.map((g, gi) => ({ g, gi }));
  const columns =
    withIdx.length > 5
      ? [
          withIdx.slice(0, Math.ceil(withIdx.length / 2)),
          withIdx.slice(Math.ceil(withIdx.length / 2)),
        ]
      : [withIdx];

  return (
    <div className="relative overflow-hidden">
      <P3Veil />
      {/* ===== 全页背景:桌面左白右蓝斜分割 + 竖排 TAGS;移动端整页蓝 + 顶部横幅 ===== */}
      <div aria-hidden className="fixed inset-0 z-0">
        {/* 右侧蓝色区:桌面斜切分割,移动端全屏 */}
        <div className="p3-split-blue absolute inset-y-0 right-0 w-[62%] max-md:inset-0 max-md:w-full bg-[#1B2FD8]" />
        {/* 左侧白色区:仅桌面 */}
        <div className="absolute inset-y-0 left-0 w-[40%] bg-white max-md:hidden" />
        {/* 竖排 TAGS 主体:桌面居中白区;移动端顶部横排横幅 */}
        <div className="absolute inset-y-0 left-0 flex w-[40%] items-center justify-center max-md:inset-x-0 max-md:bottom-auto max-md:top-0 max-md:w-full max-md:py-10">
          <h1 className="p3-drift -rotate-90 whitespace-nowrap font-brand text-[20vh] font-black italic leading-none tracking-tighter text-[#1B2FD8] max-md:rotate-0 max-md:text-6xl">
            TAGS<span className="text-[#00C8F0]">.</span>
          </h1>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="relative z-10 text-faint">空</p>
      ) : (
        // 数量扩展:错峰与位移全部封顶,tag 再多排版也不会失控。
        // 移动端(≤767px):单列、无重叠、无旋转,p3-col-item/p3-bar 的媒体查询接管
        <ul
          className={`relative z-10 grid grid-cols-1 gap-x-10 pb-4 max-md:pt-44 ${columns.length > 1 ? "md:grid-cols-2" : ""}`}
        >
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col items-end max-md:items-stretch">
              {col.map(({ g, gi }) => {
            const spec = p3spec(gi);

            /* 三角随文字长度适配:长度包住文字,右端两点随文本自主伸缩;
               左端点指向倾斜方向(左侧),右缘略矮于文字行 → 永不完全覆盖 */
            const textW = estimateTextWidth(g.tag);
            const triW = Math.max(120, Math.min(Math.round(textW * 0.95 + 24), 440));
            const triH = 50;
            const ox = -22; /* 左端点探向 TAGS 主体,偏移稍大 */
            const oy = PAD_TOP - 2;
            /* 左端点逐项偏移:指向倾斜方向但带随机偏角 */
            const apexJitter = ((spec.tri.ox + 6) % 16) - 8; /* -8 .. 8 */

            /* 顶点(Link 坐标系):左 apex(带偏移)+ 右上 + 右下 */
            const apexRel = Math.round(triH / 2) + apexJitter;
            const triPoints: [number, number][] = [
              [ox, oy + apexRel],
              [ox + triW, oy],
              [ox + triW, oy + triH],
            ];
            /* 红字副本的精确裁切区 = 三角的像素投影 */
            const absClip = `polygon(${triPoints.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;
            /* 影子/白块:百分比顶点 → 被 max-width 钳制时形状等比缩放,不会残缺 */
            const apexPct = Math.round((apexRel / triH) * 100);
            const shadowClip = `polygon(0 ${apexPct}%, 100% 0%, 100% 100%)`;
            /* 蓝底上的静置文字色:白 / 浅青交替 */
            const idleColor = gi % 2 === 0 ? "#eaf3ff" : "#9bd9f7";

            return (
              <li
                key={g.tag}
                className="p3-in p3-col-item relative hover:z-20"
                style={
                  {
                    "--edx": spec.flip ? "56px" : "-56px",
                    "--mr": `${Math.min(gi * 10, 50)}px`,
                    animationDelay: `${Math.min(gi * 60, 500)}ms`,
                  } as CSSProperties
                }
              >
                <P3TransitionLink
                  href={`/tags/${encodeURIComponent(g.tag)}`}
                  className="p3-bar group relative block w-fit py-1 pr-12"
                  style={{ "--rot": `${spec.angle / 2}deg`, "--skw": `${spec.skew}deg` } as CSSProperties}
                >
                  {/* 红色硬影(与白块同形,固定偏移,方向全站一致) */}
                  <span
                    aria-hidden
                    className="p3-tri-shadow absolute z-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                    style={
                      {
                        left: `${ox + 9}px`,
                        top: `${oy + 9}px`,
                        width: `${triW}px`,
                        height: `${triH}px`,
                        maxWidth: "calc(100vw - 48px)",
                        clipPath: shadowClip,
                        background: "#E60012",
                      } as CSSProperties
                    }
                  />
                  {/* 白色三角本体:左端点指向倾斜方向(带偏移),右端两点随文本长度伸缩 */}
                  <span
                    aria-hidden
                    className="p3-tri-white absolute z-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                    style={
                      {
                        left: `${ox}px`,
                        top: `${oy}px`,
                        width: `${triW}px`,
                        height: `${triH}px`,
                        maxWidth: "calc(100vw - 48px)",
                        clipPath: shadowClip,
                        background: "#ffffff",
                      } as CSSProperties
                    }
                  />
                  {/* 静置文字:白/浅青交替(蓝底可读);hover 瞬时隐藏(无过渡,无重影) */}
                  <span
                    className="p3-idle-text relative z-10 block whitespace-nowrap font-brand text-5xl max-md:text-3xl font-bold italic"
                    style={
                      {
                        "--idle-c": idleColor,
                        "--idle-o": spec.blue.opacity,
                      } as CSSProperties
                    }
                  >
                    {g.tag}
                    <span className="ml-3 align-middle font-sans text-base font-semibold opacity-90">
                      {g.posts.length} 篇
                    </span>
                  </span>
                  {/* hover 文字:三角外 = 半透明黑(瞬切) */}
                  <span
                    aria-hidden
                    className="p3-hover-black absolute inset-0 z-20 block whitespace-nowrap font-brand text-5xl font-bold italic text-black/55 opacity-0 group-hover:opacity-100"
                  >
                    {g.tag}
                  </span>
                  {/* hover 文字:三角内 = 血红(裁切区 = 三角的像素投影,瞬切) */}
                  <span
                    aria-hidden
                    className="p3-hover-red absolute inset-0 z-30 block whitespace-nowrap font-brand text-5xl font-bold italic text-[#c40000] opacity-0 group-hover:opacity-100"
                    style={{ clipPath: absClip } as CSSProperties}
                  >
                    {g.tag}
                  </span>
                </P3TransitionLink>
              </li>
            );
              })}
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}
