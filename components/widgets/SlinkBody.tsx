"use client";

/* S.LINK. 的内容:友链列表(名字取自 P3 的 Social Link)。
   想加友链就在下面数组里添一行;空数组时显示占位文案。 */

const FRIEND_LINKS: { name: string; url: string; desc: string }[] = [
  // { name: "示例博客", url: "https://example.com", desc: "一句话介绍" },
];

/* inColumn = 停靠展开态(列表占满剩余高度);false = 浮窗态 */
export default function SlinkBody({ inColumn }: { inColumn: boolean }) {
  if (FRIEND_LINKS.length === 0) {
    return (
      <p className="px-3 py-3 text-xs text-faint">
        虚位以待 · 想交换友链?在 CONTACT. 里找我
      </p>
    );
  }

  return (
    <ul className={inColumn ? "min-h-0 flex-1 overflow-y-auto" : ""}>
      {FRIEND_LINKS.map((f) => (
        <li key={f.name}>
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-b border-border px-3 py-2 hover:bg-surface-hover last:border-b-0"
          >
            <span className="text-xs font-bold text-foreground hover:text-accent">{f.name}</span>
            <span className="mt-0.5 block text-[10px] text-faint">{f.desc}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
