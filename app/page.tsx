import Link from "next/link";
import LatestPosts from "@/components/LatestPosts";

export default function Home() {
  return (
    <div>
      <LatestPosts />

      <section id="about" className="mt-10">
        <h2 className="text-lg font-semibold">About</h2>
        <Link href="/about" className="hover:text-blue-600">Next.js 学习中～</Link>
      </section>
    </div>
  );
}
