import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section id="articles">
        <p>文章</p>
      </section>

      <section id="about">
        <p>关于</p>
        <Link href="/about" className="text-blue-500 underline">Next.js 学习中～</Link>
      </section>
    </main>
  );
}
