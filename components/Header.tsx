"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";
import ThemePicker from "./ThemePicker";

const links = [
    {href:"/", label:"首页"},
    {href:"/posts",label:"文章"},
    {href:"/about", label:"关于"}
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="border-b border-border">
            <nav className="relative mx-auto flex max-w-2xl items-center justify-center gap-6 p-4">
                <Link href="/" className="absolute left-4 text-lg font-bold font-brand">Kiyone</Link>
                <div className="flex gap-4">
                    {links.map(({href, label}) => {
                        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                        return (
                            <Link key={href} href={href} className={active ? "text-accent font-semibold" : "text-muted hover:text-foreground"}>
                                {label}
                            </Link>
                        )
                    })}
                </div>
                <div className="absolute right-4">
                    <ThemePicker />
                </div>
            </nav>
        </header>
    )
}