"use client";

import { useState } from "react";

/* CONTACT. 的内容:联系方式列表。
   想增删联系方式就改下面这个数组,一行一条;不想展示的删掉即可。
   三种行:
   - url 行:普通链接,点击跳转(新标签页);
   - image 行:点击在行内展开/收起一张图(如好友二维码),不跳走;
   - 无 url 的行:纯展示 ID(如 Ubisoft),不可点。 */

type Contact = {
  label: string;
  handle: string;
  url?: string;
  image?: string;
};

const CONTACTS: Contact[] = [
  { label: "GitHub", handle: "@Your-S04", url: "https://github.com/Your-S04" },
  { label: "Email", handle: "235304049@qq.com", url: "mailto:235304049@qq.com" },
  { label: "RSS", handle: "订阅kiyone.top", url: "/feed.xml" },
  { label: "Steam", handle: "1510624398", url: "https://steamcommunity.com/profiles/76561199470890126/" },
  // 育碧 Connect 没有公开主页链接,先做纯展示行(好友手动搜 ID);
  // 以后找到可挂的链接,补个 url 字段就自动变成可点击
  { label: "Ubisoft", handle: "AI.Montreal" },
  // 明日方舟加好友:游戏内「好友 → 添加好友 → 我的名片」截图,
  // 建议裁成以二维码为主的近方形图,存为 public/arknights-qr.png
  // (放好之前展开会显示裂图)
  { label: "Arknights", handle: "518948925", image: "/arknights-qr.png" },
];

/* inColumn = 停靠展开态(列表占满剩余高度);false = 浮窗态 */
export default function ContactBody({ inColumn }: { inColumn: boolean }) {
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <ul className={inColumn ? "min-h-0 flex-1 overflow-y-auto" : ""}>
      {CONTACTS.map((c) => (
        <li key={c.label}>
          {c.image ? (
            <>
              <button
                type="button"
                onClick={() => setQrOpen((v) => !v)}
                aria-expanded={qrOpen}
                className="flex w-full items-baseline justify-between gap-2 border-b border-border px-3 py-2 text-xs hover:bg-surface-hover"
              >
                <span className="shrink-0 font-bold text-foreground">{c.label}</span>
                <span className="truncate text-faint">{qrOpen ? "收起 ▲" : c.handle}</span>
              </button>
              {qrOpen && (
                <div className="bg-surface px-3 py-3">
                  {/* 二维码是站内静态图,不需要 next/image 优化管线 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={`${c.label}好友二维码`}
                    className="mx-auto block h-auto w-56"
                  />
                  <p className="mt-1.5 text-center text-[10px] text-faint">
                    游戏内「扫一扫」识别,或长按保存图片
                  </p>
                </div>
              )}
            </>
          ) : c.url ? (
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-baseline justify-between gap-2 border-b border-border px-3 py-2 text-xs hover:bg-surface-hover last:border-b-0"
            >
              <span className="shrink-0 font-bold text-foreground">{c.label}</span>
              <span className="truncate text-faint">{c.handle}</span>
            </a>
          ) : (
            /* 纯展示行:没有可跳转的链接,只亮出 ID */
            <div className="flex items-baseline justify-between gap-2 border-b border-border px-3 py-2 text-xs last:border-b-0">
              <span className="shrink-0 font-bold text-foreground">{c.label}</span>
              <span className="truncate text-faint">{c.handle}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
