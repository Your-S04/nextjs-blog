"use client";

import { usePathname } from "next/navigation";
import AuthWidget from "@/components/AuthWidget";
import P3TransitionLink from "@/components/P3TransitionLink";
import ThemePicker from "@/components/ThemePicker";

const links = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/about", label: "关于" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b-[3px] border-foreground">
      <nav className="relative mx-auto flex max-w-2xl items-center justify-center gap-1.5 p-4">
        <P3TransitionLink
          href="/"
          className="absolute left-4 -skew-x-6 bg-foreground px-2 py-0.5 text-lg font-bold font-brand italic text-background shadow-[3px_3px_0_0_var(--shadow)]"
        >
          <span className="inline-block skew-x-6">Kiyone</span>
        </P3TransitionLink>
        <div className="flex items-center gap-1.5">
          {links.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return active ? (
              <P3TransitionLink
                key={href}
                href={href}
                className="-skew-x-6 bg-accent px-2 py-0.5 font-semibold text-background"
              >
                <span className="inline-block skew-x-6">{label}</span>
              </P3TransitionLink>
            ) : (
              <P3TransitionLink
                key={href}
                href={href}
                className="px-1.5 py-0.5 text-muted transition-colors hover:text-foreground"
              >
                {label}
              </P3TransitionLink>
            );
          })}
        </div>
        <div className="absolute right-4 flex items-center gap-3">
          <AuthWidget />
          <ThemePicker />
        </div>
      </nav>
    </header>
  );
}
