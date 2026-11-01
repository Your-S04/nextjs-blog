import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* /robots.txt:允许全站爬取,挡掉 API 路由(带写副作用,别让爬虫踩);
   顺手把 sitemap 位置报给搜索引擎。构建期生成静态文件。 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
