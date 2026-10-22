/**
 * P3 排版引擎:把"前卫的混乱"参数化。
 * 给定索引,输出一份确定性的排版规格(角度/斜切/形状/双层色块偏移/文字配色对),
 * 供 tag 相关页面消费。所有伪随机由种子索引驱动 —— SSR 与水合渲染完全一致。
 *
 * 设计要点:
 * - 红白双层色块共享同一个 clip-path 形状,仅位移向量不同(v21 的套印错位)
 * - 文字配色与色块是成对的耦合关系:前块是红 → hover 文字必是白;
 *   前块是白/青 → hover 文字必是黑。颜色互动不割裂。
 * - 立体感:三层(背块/文字/前块)的 hover 位移距离不同,远景少、前景多。
 */

export type P3Spec = {
  /** 整条目的旋转角(度),方向与幅度伪随机 */
  angle: number;
  /** 斜切角(度) */
  skew: number;
  /** 双层色块共享的形状 */
  shape: string;
  /** 背层色块:静态偏移(ox,oy)+ hover 附加位移(dx,dy) */
  back: { ox: number; oy: number; dx: number; dy: number; color: string };
  /** 前层色块:位移比背层大 → 立体视差 */
  front: { ox: number; oy: number; dx: number; dy: number; color: string };
  /** 文字配色对:idle 色与 hover 色(由前块颜色决定) */
  textColor: { idle: string; hover: string };
  /** 悬浮动画的相位错开 */
  floatDelay: number;
  /** 入场滑入方向 */
  flip: boolean;
  /** 静置文字:深蓝→浅蓝随机色 + 透明度 */
  blue: { color: string; opacity: number };
  /** hover 时"血红带"的斜向渐变参数(角度 + 硬停区间,百分比) */
  band: { angle: number; start: number; end: number };
  /** 白色三角形在文字块内的位置偏移(逐项不同) */
  tri: { ox: number; oy: number };
};

const shapes = [
  "polygon(6% 0, 100% 8%, 94% 100%, 0 92%)",
  "polygon(0 10%, 94% 0, 100% 90%, 8% 100%)",
  "polygon(4% 4%, 100% 0, 96% 96%, 0 100%)",
];

/** 线性同余伪随机:同一种子序列恒定 */
function lcg(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** 文字与双层色块的耦合配色对(成套出现,不可拆) */
const COLOR_PAIRS = [
  { back: "#ffffff", front: "#e60012", idle: "var(--foreground)", hover: "#ffffff" },
  { back: "#e60012", front: "#ffffff", idle: "#35c8f0", hover: "#0a0a0a" },
  { back: "#ffffff", front: "#35c8f0", idle: "var(--foreground)", hover: "#0a0a0a" },
];

/** 深蓝 → 浅蓝插值(总览页静置文字的随机取色) */
function blueMix(t: number): string {
  const r = Math.round(11 + t * (155 - 11));
  const g = Math.round(63 + t * (209 - 63));
  const b = Math.round(168 + t * (245 - 168));
  return `rgb(${r}, ${g}, ${b})`;
}

export function p3spec(i: number): P3Spec {
  const rnd = lcg(i + 1);
  const round = (n: number) => Math.round(n * 10) / 10;

  const angle = round(rnd() * 14 - 9); // -9° .. 5°
  const skew = round(rnd() * 16 - 10); // -10° .. 6°
  const shape = shapes[i % shapes.length];
  const flip = rnd() > 0.5;
  const pair = COLOR_PAIRS[i % COLOR_PAIRS.length];

  const blueT = rnd();
  const bandStart = 34 + Math.round(rnd() * 14);

  return {
    angle,
    skew,
    shape,
    flip,
    blue: { color: blueMix(blueT), opacity: round(0.72 + rnd() * 0.24) },
    band: {
      angle: 100 + Math.round(rnd() * 30),
      start: bandStart,
      end: bandStart + 12 + Math.round(rnd() * 8),
    },
    tri: { ox: Math.round(rnd() * 24 - 6), oy: Math.round(rnd() * 12 - 8) },
    back: {
      ox: -round(6 + rnd() * 6),
      oy: -round(3 + rnd() * 4),
      dx: -round(4 + rnd() * 4),
      dy: -round(2 + rnd() * 2),
      color: pair.back,
    },
    front: {
      ox: round(6 + rnd() * 8),
      oy: round(2 + rnd() * 4),
      dx: round(10 + rnd() * 6),
      dy: round(2 + rnd() * 3),
      color: pair.front,
    },
    textColor: { idle: pair.idle, hover: pair.hover },
    floatDelay: round(rnd() * 2),
  };
}
