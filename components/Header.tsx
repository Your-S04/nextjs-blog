"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";

const links = [
    {href:"/", label:"首页"},
    {href:"/posts",label:"文章"},
    {href:"/about", label:"关于"}
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="border-b border-gray-200">
            <nav className="max-w-2xl mx-auto flex items-center gap-6 p-4">
                <Link href="/" className="text-lg font-bold">Kiyo</Link>
                <div className="flex gap-4">
                    {links.map(({href, label}) => {
                        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                        return (
                            <Link key={href} href={href} className={active ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-900"}>
                                {label}
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </header>
    )
}