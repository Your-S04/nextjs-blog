import { getAllPosts, getPost } from "@/lib/posts";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

/* /feed.xml:RSS 2.0 订阅源,构建期生成静态文件(force-static,不占运行时)。
   description 取正文第一段,顺手剥掉最常见的 Markdown 记号。 */

export const dynamic = "force-static";

function excerpt(content: string): string {
  const first = content.split(/\n\s*\n/).find((s) => s.trim()) ?? "";
  return first
    .replace(/[#>*`~[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const items = getAllPosts()
    .map((p) => {
      const d = new Date(p.date);
      const pubDate = Number.isNaN(d.getTime())
        ? "" // BCE 等解析不出的日期不带 pubDate(RSS 里它是可选字段)
        : `      <pubDate>${d.toUTCString()}</pubDate>`;
      const { content } = getPost(p.slug);
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${SITE_URL}/posts/${p.slug}</link>`,
        `      <guid isPermaLink="true">${SITE_URL}/posts/${p.slug}</guid>`,
        pubDate,
        `      <description>${esc(excerpt(content))}</description>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
