import Link from "next/link";
import LatestPosts from "@/components/LatestPosts";

export default function Home() {
  return (
    <main>
      <LatestPosts />

      <section id="about">
        <p>关于</p>
        <Link href="/about" className="text-blue-500 underline">Next.js 学习中～</Link>
      </section>
    </main>
  );
}
