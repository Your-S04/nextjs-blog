import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function LatestPosts({ count = 5 }: { count?: number }) {
    const latest = getAllPosts().slice(0, count);

    if (latest.length === 0 ) {
        return <p className="text-gray-400">空</p>;
    }

    return (
        <section>
            <h1 className="text-2xl font-bold mb-6">Latest Posts</h1>
            <ul className="space-y-3">
                {latest.map((p) => (
                    <li key={p.slug} className="border-b border-gray-100 pb-3">
                        <Link href={`/posts/${p.slug}`}
                            className="text-lg font-medium hover:text-blue-600">
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
            <div className="mt-6 text-center">
                <Link href="/posts" className="text-sm hover:text-blue-600">
                    all
                </Link>
            </div>
        </section>
    )
}