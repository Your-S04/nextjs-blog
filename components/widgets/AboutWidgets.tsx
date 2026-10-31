"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import CommitsBody from "@/components/widgets/CommitsBody";
import ContactBody from "@/components/widgets/ContactBody";
import SlinkBody from "@/components/widgets/SlinkBody";

/* About 页的漂浮组件组外壳:拖拽 / 边缘吸附 / 同侧手风琴 / 停靠队列布局。
   组件内容在 components/widgets/ 下各自成文件,想加组件:
   1. 新建一个 XxxBody.tsx(接收 inColumn 布尔 props);
   2. 在下面 GROUP 数组里加一行。
   外壳逻辑(本文件)完全不用动。

   规则:初始全部折叠停靠在视口右侧,纵向排成一列;
   点击标题条(或 +/- 按钮)展开,同侧其他组件自动收起(手风琴);
   按住标题条可把任意组件拖出成为自由浮窗,各自独立展开互不影响;
   浮窗拖近视口左/右边缘(48px 内)出现贴边高亮,松手即停靠并入该侧队列。
   摆放状态持久化到 localStorage,刷新后恢复。 */

const STATE_KEY = "kiyone-about-widgets";

const W = 288; // 组件宽度(w-72),吸附计算用
const EDGE = 8; // 停靠时与视口边缘的间距
const GAP = 8; // 同侧停靠队列中相邻组件的间距
const SNAP = 48; // 距边缘多少 px 内出现吸附提示
const COLLAPSED_H = 32; // 折叠态总高(h-7 标题条 28 + 上下边框 4)

/* ===== 组件清单:顺序 = 同侧停靠时从上到下的排列顺序 ===== */
const GROUP = [
  {
    id: "commits",
    title: "COMMITS.",
    sub: "nextjs-blog",
    body: (inColumn: boolean) => <CommitsBody inColumn={inColumn} />,
  },
  {
    id: "contact",
    title: "CONTACT.",
    body: (inColumn: boolean) => <ContactBody inColumn={inColumn} />,
  },
  {
    id: "slink",
    title: "S.LINK.",
    body: (inColumn: boolean) => <SlinkBody inColumn={inColumn} />,
  },
] as const;

type WidgetId = (typeof GROUP)[number]["id"];
type Dock = "left" | "right";
type Pos = { x: number; y: number };

/* 摆放状态:停靠态(dock 非 null)与自由态(pos)互斥 */
type WidgetState = {
  expanded: boolean;
  dock: Dock | null; // null = 自由浮窗
  pos: Pos | null; // 浮窗位置(停靠时不用)
};

const DEFAULT_STATE = Object.fromEntries(
  GROUP.map((g) => [g.id, { expanded: false, dock: "right", pos: null }]),
) as Record<WidgetId, WidgetState>;

function isDock(v: unknown): v is Dock {
  return v === "left" || v === "right";
}

function isPos(v: unknown): v is Pos {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Pos).x === "number" &&
    typeof (v as Pos).y === "number"
  );
}

export default function AboutWidgets() {
  const rootRefs = useRef<Partial<Record<WidgetId, HTMLDivElement | null>>>({});
  const dragRef = useRef<{
    id: WidgetId;
    dx: number;
    dy: number;
    moved: boolean;
  } | null>(null);

  const [widgets, setWidgets] = useState<Record<WidgetId, WidgetState>>(DEFAULT_STATE);
  const [snap, setSnap] = useState<Dock | null>(null); // 拖动中的吸附提示
  const [draggingId, setDraggingId] = useState<WidgetId | null>(null);

  /* 把浮窗位置夹回视口内(四边至少留 EDGE px) */
  const clampPos = useCallback((p: Pos, el?: HTMLDivElement | null): Pos => {
    const w = el?.offsetWidth ?? W;
    const h = el?.offsetHeight ?? 120;
    return {
      x: Math.min(Math.max(EDGE, p.x), Math.max(EDGE, window.innerWidth - w - EDGE)),
      y: Math.min(Math.max(EDGE, p.y), Math.max(EDGE, window.innerHeight - h - EDGE)),
    };
  }, []);

  /* 挂载恢复摆放状态;没有存档则保持默认(全折叠停靠右侧) */
  useEffect(() => {
    let restored: Record<WidgetId, WidgetState> = DEFAULT_STATE;
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<WidgetId, WidgetState>> | null;
        if (parsed && typeof parsed === "object") {
          restored = { ...DEFAULT_STATE };
          for (const g of GROUP) {
            const s = parsed[g.id];
            if (!s) continue;
            restored[g.id] = {
              expanded: !!s.expanded,
              dock: isDock(s.dock) ? s.dock : null,
              pos: isPos(s.pos) ? s.pos : null,
            };
          }
          /* 存档位置夹回当前视口:大屏拖到边缘的坐标,小屏打开不至于丢在屏外 */
          for (const g of GROUP) {
            const st = restored[g.id];
            if (st.pos) {
              restored[g.id] = { ...st, pos: clampPos(st.pos, rootRefs.current[g.id]) };
            }
          }
        }
      }
    } catch {
      /* 隐私模式等场景静默失败 */
    }
    /* 挂载后从 localStorage 恢复摆放状态:多一次渲染是有意的初始化,
       非级联更新;useSyncExternalStore 对这种一次性恢复过重 */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWidgets(restored);
  }, [clampPos]);

  /* 摆放状态落盘(外部系统同步,放 effect 正合适) */
  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(widgets));
    } catch {
      /* 隐私模式等场景静默失败 */
    }
  }, [widgets]);

  /* 视口尺寸变化:重算停靠队列与浮窗夹取(靠重渲染触发) */
  const [, setTick] = useState(0);
  useEffect(() => {
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* 展开/收起:展开时收起同侧已展开的其他组件(浮窗不受影响) */
  const toggleExpand = useCallback((id: WidgetId) => {
    setWidgets((ws) => {
      const me = ws[id];
      const next = !me.expanded;
      const mapped = { ...ws };
      for (const g of GROUP) {
        const w = ws[g.id];
        if (g.id !== id && next && w.expanded && w.dock !== null && w.dock === me.dock) {
          mapped[g.id] = { ...w, expanded: false };
        }
      }
      mapped[id] = { ...me, expanded: next };
      return mapped;
    });
  }, []);

  /* 停靠到某侧:并入该侧队列;若带着展开态入场,收起该侧原展开的组件 */
  const dockTo = useCallback((id: WidgetId, side: Dock) => {
    setWidgets((ws) => {
      const me = ws[id];
      const mapped = { ...ws };
      for (const g of GROUP) {
        const w = ws[g.id];
        if (g.id !== id && me.expanded && w.expanded && w.dock === side) {
          mapped[g.id] = { ...w, expanded: false };
        }
      }
      mapped[id] = { ...me, dock: side, pos: null };
      return mapped;
    });
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: WidgetId) => {
    if ((e.target as HTMLElement).closest("button")) return; // +/- 按钮自己处理点击
    const el = rootRefs.current[id];
    if (!el) return;
    const r = el.getBoundingClientRect();
    dragRef.current = { id, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>, id: WidgetId) => {
    const d = dragRef.current;
    if (!d || d.id !== id) return;
    if (!d.moved) {
      d.moved = true;
      setDraggingId(id);
    }
    const x = e.clientX - d.dx;
    const y = e.clientY - d.dy;
    /* 拖动即脱离停靠,转为自由跟随(同一 DOM 节点只换 style,捕获不中断) */
    setWidgets((ws) => ({
      ...ws,
      [id]: { ...ws[id], dock: null, pos: clampPos({ x, y }, rootRefs.current[id]) },
    }));
    setSnap(
      x <= SNAP ? "left" : x >= window.innerWidth - W - SNAP ? "right" : null,
    );
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>, id: WidgetId) => {
    const d = dragRef.current;
    if (!d || d.id !== id) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggingId(null);

    if (!d.moved) {
      toggleExpand(id); // 原地点击标题条 = 展开/收起
      setSnap(null);
      return;
    }

    if (snap) {
      dockTo(id, snap); // 松手停在边缘 → 停靠
    } else {
      /* 自由态:从 DOM 读最终位置夹取(比闭包里的 state 可靠) */
      const el = rootRefs.current[id];
      if (el) {
        const r = el.getBoundingClientRect();
        const final = clampPos({ x: r.left, y: r.top }, el);
        setWidgets((ws) => ({ ...ws, [id]: { ...ws[id], dock: null, pos: final } }));
      }
    }
    setSnap(null);
  };

  const onPointerCancel = (_e: React.PointerEvent<HTMLDivElement>, id: WidgetId) => {
    if (dragRef.current?.id !== id) return;
    dragRef.current = null;
    setDraggingId(null);
    setSnap(null);
  };

  /* ===== 停靠队列布局:同侧组件从视口顶排到底,展开者占满剩余高度 ===== */
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const tops: Partial<Record<WidgetId, { side: Dock; top: number; height?: number }>> = {};
  for (const side of ["left", "right"] as Dock[]) {
    const ids = GROUP.filter((g) => widgets[g.id].dock === side).map((g) => g.id);
    if (ids.length === 0) continue;
    const expandedIds = ids.filter((id) => widgets[id].expanded);
    const collapsedCount = ids.length - expandedIds.length;
    let y = EDGE;
    /* 规则保证同侧最多一个展开,这里防御式均分剩余高度 */
    const expH =
      expandedIds.length > 0
        ? Math.floor(
            Math.max(COLLAPSED_H, vh - 2 * EDGE - collapsedCount * COLLAPSED_H - (ids.length - 1) * GAP) /
              expandedIds.length,
          )
        : 0;
    for (const id of ids) {
      const exp = widgets[id].expanded;
      tops[id] = { side, top: y, ...(exp && expandedIds.length > 0 ? { height: expH } : {}) };
      y += (exp && expandedIds.length > 0 ? expH : COLLAPSED_H) + GAP;
    }
  }

  return (
    <>
      {GROUP.map((g) => {
        const st = widgets[g.id];
        const slot = tops[g.id];
        const isDragging = draggingId === g.id;
        const inColumn = slot !== undefined && st.expanded; // 停靠 + 展开 = 纵向拉满

        let style: CSSProperties;
        if (slot) {
          style = {
            top: slot.top,
            left: slot.side === "left" ? EDGE : undefined,
            right: slot.side === "right" ? EDGE : undefined,
            ...(slot.height ? { height: slot.height } : {}),
          };
        } else if (st.pos) {
          style =
            isDragging && snap
              ? {
                  top: st.pos.y,
                  left: snap === "left" ? EDGE : undefined,
                  right: snap === "right" ? EDGE : undefined,
                  boxShadow: "6px 6px 0 0 var(--accent)", // 吸附提示:影子变强调色
                }
              : { left: st.pos.x, top: st.pos.y };
        } else {
          style = {};
        }

        return (
          <div
            key={g.id}
            ref={(el) => {
              rootRefs.current[g.id] = el;
            }}
            aria-label={g.title}
            style={style}
            className={`fixed w-72 border-2 border-foreground bg-background shadow-[5px_5px_0_0_var(--shadow)] ${
              inColumn ? "flex flex-col" : ""
            } ${isDragging ? "z-[70] select-none" : "z-[60]"}`}
          >
            {/* 标题条 = 拖动把手 + 点击展开;touch-none 防止触屏拖动时页面滚动 */}
            <div
              onPointerDown={(e) => onPointerDown(e, g.id)}
              onPointerMove={(e) => onPointerMove(e, g.id)}
              onPointerUp={(e) => endDrag(e, g.id)}
              onPointerCancel={(e) => onPointerCancel(e, g.id)}
              className={`flex h-7 shrink-0 touch-none items-center justify-between bg-foreground px-2.5 text-background ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <span className="font-brand text-xs font-bold italic tracking-wide">
                {g.title}
                {"sub" in g && g.sub && (
                  <span className="ml-1.5 font-sans text-[10px] not-italic opacity-80">{g.sub}</span>
                )}
              </span>
              <button
                type="button"
                aria-label={st.expanded ? `折叠 ${g.title}` : `展开 ${g.title}`}
                onClick={() => toggleExpand(g.id)}
                className="flex h-5 w-5 items-center justify-center border border-background/60 text-xs leading-none hover:bg-background hover:text-foreground"
              >
                {st.expanded ? "−" : "+"}
              </button>
            </div>

            {/* 内容常驻挂载(收起仅 display:none),提交数据只在首挂载拉一次 */}
            <div
              className={`${inColumn ? "flex min-h-0 flex-1 flex-col" : ""} ${
                st.expanded ? "" : "hidden"
              }`}
            >
              {g.body(inColumn)}
            </div>
          </div>
        );
      })}
    </>
  );
}
