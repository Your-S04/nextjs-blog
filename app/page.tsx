import Link from "next/link";
import LatestPosts from "@/components/LatestPosts";
import VisitorCounter from "@/components/VisitorCounter";

export default function Home() {
  return (
    <div>
      <LatestPosts />

      <section id="about" className="mt-10">
        <h2 className="text-lg font-semibold">About</h2>
        <Link href="/about" className="hover:text-accent">Next.js 学习中～</Link>
      </section>

      <VisitorCounter />
    </div>
  );
}
