import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function LatestPosts({ count = 5 }: { count?: number }) {
    const latest = getAllPosts().slice(0, count);

    if (latest.length === 0 ) {
        return <p className="text-gray-400">空</p>;
    }

    return (
        <section>
            <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-bold">Latest</h2>
                <Link href="/posts" className="text-sm text-blue-600 hover:underline">
                    all
                </Link>
            </div>
            <ul className="space-y-3">
                {latest.map((p) => (
                    <li key={p.slug} className="border-b border-gray-100 pb-3">
                        <Link href={`/posts/${p.slug}`}
                            className="text-lg text-blue-600 hover:underline">
                                {p.title}
                            </Link>
                            <div className="flex gap-2 mt-1 items-center">
                                <span className="text-sm text-gray-400">{p.date}</span>
                                {p.tags.map((t) => (
                                    <Link key={t} href={`/tags/${encodeURIComponent(t)}`}
                                        className="text-xs bg-gray-100 rounded-full px-2 py-0.5 hover:bg-gray-200">
                                            {t}
                                    </Link>
                                ))}
                            </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}