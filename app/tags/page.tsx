import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getPostsGroupedByTag } from "@/lib/posts";
import { p3spec } from "@/lib/p3";
import P3TransitionLink from "@/components/P3TransitionLink";

export const metadata: Metadata = {
  title: "标签",
};

/* 估算 text-5xl 粗斜体的文字宽度:CJK ≈ 46px,拉丁 ≈ 27px */
function estimateTextWidth(tag: string): number {
  return [...tag].reduce(
    (w, ch) => w + (ch.charCodeAt(0) > 255 ? 46 : 27),
    0,
  );
}

/* P3 系统式选中尖刺(P3 菜单 ROLLBACK/SKILL 同款):
   细长不对称楔形 —— 尖端在文字左下方外侧(贴近基线),上缘陡升、
   下缘近水平,右缘向后倾斜收尾(swoosh);倾角逐条伪随机变化。
   白色本体 + 血红同形错位副本(+9,+9,全站统一硬影方向),
   hover 文字整行变朱红。 */
const SPIKE_TOP = -4; /* 尖刺盒上缘(略高于文字顶) */
const SPIKE_H = 46; /* 尖刺盒高 */
const APEX_Y = 40; /* 尖端在盒内的纵位 ≈ 文字基线 */
const TAIL_INSET = 22; /* 右下角相对右上角左收的距离(swoosh 感) */

/* P3 海报样式(总览页):左侧竖排 TAGS. 主体(桌面)+ 左纸右海报色撞色分割
   (fixed);tag 列表永久单列、右对齐、轻微重叠错落。 */
export default function TagsPage() {
  const groups = getPostsGroupedByTag();

  return (
    <div className="relative">
      {/* ===== 全页背景:白色刊头纸带(竖切)+ 斜切海报底 + 竖排 TAGS. ===== */}
      <div aria-hidden className="fixed inset-0 z-0">
        <div className="absolute inset-y-0 left-0 w-[40%] border-r-[3px] border-[var(--band-ink)] bg-[var(--band)] max-md:hidden" />
        <div className="p3-split-blue absolute inset-y-0 right-0 w-[62%] max-md:inset-0 max-md:w-full bg-poster" />
        <div className="absolute inset-y-0 left-0 flex w-[40%] items-center justify-center max-md:hidden">
          <h1 className="p3-drift -rotate-90 whitespace-nowrap font-brand text-[20vh] font-black italic leading-none tracking-tighter text-[var(--band-ink)]">
            TAGS<span className="text-[var(--shadow)]">.</span>
          </h1>
        </div>
      </div>

      {/* 小 TAGS. 标题:仅移动端(竖屏阅读) */}
      <h1 className="relative z-10 mb-6 ml-1.5 w-fit -skew-x-6 bg-foreground px-4 py-1 font-brand text-2xl font-bold italic uppercase text-background p3-in max-md:flex md:hidden">
        <span className="inline-block skew-x-6">
          TAGS<span className="text-background">.</span>
        </span>
      </h1>

      {groups.length === 0 ? (
        <p className="relative z-10 text-faint">空</p>
      ) : (
        /* 永久单列:右对齐 + 轻微重叠错落,文字骑在斜切分割线上与背景反色 */
        <ul className="relative grid grid-cols-1 justify-items-end gap-y-3 pb-4">
          {groups.map((g, gi) => {
            const spec = p3spec(gi);

            /* 尖刺几何:随文字长度伸缩,尖端左探约 15% 文字宽,右缘略扫过计数 */
            const textW = estimateTextWidth(g.tag);
            const spikeLeft = -(Math.round(textW * 0.15) + 16);
            const spikeW = textW + 34 - spikeLeft;
            /* 倾角逐条变化(p3spec 确定性伪随机):-1° .. 12°,均值 ≈ 5° */
            const jitter = ((spec.tri.ox % 14) + 14) % 14;
            const spikeRotateDeg = jitter - 1;
            const spikeRotate = `${spikeRotateDeg}deg`;
            /* 尖刺形状:细长三角,尖端在基线处左探 */
            const triShape = `polygon(0px ${APEX_Y}px, ${spikeW}px 0px, ${spikeW - TAIL_INSET}px ${SPIKE_H}px)`;
            /* 悬停反色文字的裁切区 = 色块 ∪ 阴影的联合投影(含逐条倾角旋转):
               单色主题裁到联合区(块上块下同色),P3 只裁色块(红字层次) */
            const rad = (spikeRotateDeg * Math.PI) / 180;
            const cosR = Math.cos(rad);
            const sinR = Math.sin(rad);
            const ccx = spikeW / 2;
            const ccy = SPIKE_H / 2;
            const projPt = (x: number, y: number) =>
              `${spikeLeft + ccx + (x - ccx) * cosR - (y - ccy) * sinR}px ${SPIKE_TOP + ccy + (x - ccx) * sinR + (y - ccy) * cosR}px`;
            const absClipUnion = `polygon(${projPt(0, APEX_Y)}, ${projPt(spikeW, 0)}, ${projPt(spikeW + 9, 9)}, ${projPt(spikeW - TAIL_INSET - 9, SPIKE_H + 9)}, ${projPt(9, SPIKE_H + 9)})`;

            /* 静置文字色:海报墨 / 次级色交替(只落在海报区,无需混合) */
            const idleColor = gi % 2 === 0 ? "var(--poster-ink)" : "var(--accent-3)";

            return (
              <li
                key={g.tag}
                className="p3-in p3-col-item relative"
                style={
                  {
                    "--edx": spec.flip ? "56px" : "-56px",
                    "--mr": `${Math.min(gi * 10, 50)}px`,
                    "--d": `${Math.min(gi * 60, 240)}ms`,
                  } as CSSProperties
                }
              >
                <P3TransitionLink
                  href={`/tags/${encodeURIComponent(g.tag)}`}
                  /* 父级不携带 transform(避免隔离子层与背景的混合),
                     rotate/skew 下放给各层自行应用 */
                  className="group relative block w-fit py-1 pr-12"
                  style={{ "--rot": `${spec.angle / 2}deg`, "--skw": `${spec.skew}deg` } as CSSProperties}
                >
                  {/* 血红错位副本:与白色尖刺同形,+9,+9 固定偏移 */}
                  <span
                    aria-hidden
                    className="p3-tri-shadow absolute z-0 opacity-0 transition-opacity duration-100"
                    style={
                      {
                        left: `${spikeLeft + 9}px`,
                        top: `${SPIKE_TOP + 9}px`,
                        width: `${spikeW}px`,
                        height: `${SPIKE_H}px`,
                        clipPath: triShape,
                        rotate: `calc(var(--rot, 0deg) + ${spikeRotate})`,
                        transform: "skewX(var(--skw, 0deg))",
                      } as CSSProperties
                    }
                  />
                  {/* 白色尖刺本体 */}
                  <span
                    aria-hidden
                    className="p3-tri-white absolute z-0 opacity-0 transition-opacity duration-100"
                    style={
                      {
                        left: `${spikeLeft}px`,
                        top: `${SPIKE_TOP}px`,
                        width: `${spikeW}px`,
                        height: `${SPIKE_H}px`,
                        clipPath: triShape,
                        rotate: `calc(var(--rot, 0deg) + ${spikeRotate})`,
                        transform: "skewX(var(--skw, 0deg))",
                      } as CSSProperties
                    }
                  />
                  {/* 静置文字:反色混合(单色主题),跨骑分割线自动反转;hover 瞬时隐藏 */}
                  <span
                    className="p3-idle-text relative z-10 block whitespace-nowrap font-brand text-5xl font-bold italic"
                    style={
                      {
                        "--idle-c": idleColor,
                        "--idle-o": spec.blue.opacity,
                        rotate: "var(--rot, 0deg)",
                        transform: "skewX(var(--skw, 0deg))",
                      } as CSSProperties
                    }
                  >
                    {g.tag}
                    <span className="ml-3 align-middle font-sans text-base font-semibold opacity-90">
                      {g.posts.length} 篇
                    </span>
                  </span>
                  {/* hover 文字:裁切区按主题切换 —— 单色 = 色块∪阴影联合投影
                      (文字反色统一),P3 = 色块投影(红字层次) */}
                  <span
                    aria-hidden
                    className="p3-hover-red absolute inset-0 z-20 block whitespace-nowrap font-brand text-5xl font-bold italic text-accent-2 opacity-0"
                    style={{
                      clipPath: "var(--hover-clip, none)",
                      "--uc": absClipUnion,
                      rotate: "var(--rot, 0deg)",
                      transform: "skewX(var(--skw, 0deg))",
                    } as CSSProperties}
                  >
                    {g.tag}
                  </span>
                </P3TransitionLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
