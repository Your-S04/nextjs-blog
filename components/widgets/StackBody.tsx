"use client";

/* STACK. 的内容:建站技术栈。
   想增删就改下面这个数组,一行一项,纵向排列。 */

const STACK = ["Next.js 16", "React 19", "Tailwind CSS 4", "TypeScript", "Turso", "Vercel"];

/* inColumn = 停靠展开态;false = 浮窗态 */
export default function StackBody({ inColumn }: { inColumn: boolean }) {
  return (
    <ul className={inColumn ? "min-h-0 flex-1 overflow-y-auto" : ""}>
      {STACK.map((t) => (
        <li
          key={t}
          className="border-b border-border px-3 py-2 text-xs font-bold text-foreground last:border-b-0"
        >
          <span className="inline-block -skew-x-6">{t}</span>
        </li>
      ))}
    </ul>
  );
}
