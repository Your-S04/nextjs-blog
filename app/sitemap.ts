import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

/* /sitemap.xml:静态页 + 全部文章 + 全部标签页。
   文章 lastModified 用 frontmatter 的日期(比构建时间更诚实);
   BCE 这类解析不出的奇葩日期退回构建时间。构建期生成静态文件。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/posts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/memory`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const posts: MetadataRoute.Sitemap = getAllPosts().map((p) => {
    const d = new Date(p.date);
    return {
      url: `${SITE_URL}/posts/${p.slug}`,
      lastModified: Number.isNaN(d.getTime()) ? now : d,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  const tags: MetadataRoute.Sitemap = getAllTags().map((t) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(t)}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...posts, ...tags];
}
