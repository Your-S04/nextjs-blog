import Link from "next/link";

export default function Home() {
  const name = "Haoran";
  return (
    <main>
      <header>
        <a href="#top">Hi.</a>
        <nav aria-label="导航">
          <a href="#articles">文章</a>
          <a href="#about">关于</a>
        </nav>
      </header>

      <section id="articles">
        <p>文章</p>
      </section>

      <section id="about">
        <p>关于</p>
        <Link href="/about" className="text-blue-500 underline">Next.js 学习中～</Link>
      </section>

      <footer>© 2026 {name} </footer>
    </main>
  );
}
