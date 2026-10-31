import fs from "fs";
import path from "path";
import { imageSize } from "image-size";
import { parseFrontmatter } from "@/lib/posts";

/* 游戏记忆数据:content/memories/*.md,一条记忆一个文件。
   frontmatter 字段:
     date: 2026-10-25            日期(YYYY-MM-DD,按倒序排)
     game: 明日方舟              游戏名,单个字符串或 [a, b] 数组都行
     friends: [朋友A, 朋友B]     同行的朋友(可省)
     images: [截图1.jpg]         图片文件名,相对 public/memories/(可省)
   正文就是记忆本身(几句话,保留换行)。构建期读取,页面全静态。
   图片顺带读出尺寸,给 next/image 做优化缩略图。 */

const memoriesDir = path.join(process.cwd(), "content", "memories");

/* 读图片宽高(纯 JS 解析头部);文件缺失或解析失败给保底比例 */
function readDims(abs: string): { width: number; height: number } {
  try {
    const d = imageSize(fs.readFileSync(abs));
    return { width: d.width ?? 800, height: d.height ?? 600 };
  } catch {
    return { width: 800, height: 600 };
  }
}

export type Memory = {
  id: string; // 文件名(去 .md),用作 key 与灯箱定位
  date: string;
  games: string[];
  friends: string[];
  images: { src: string; caption: string; width: number; height: number }[];
  body: string;
};

export function getMemories(): Memory[] {
  if (!fs.existsSync(memoriesDir)) return [];

  return fs
    .readdirSync(memoriesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(memoriesDir, f), "utf8");
      const { data, content } = parseFrontmatter(raw);
      const images = Array.isArray(data.images) ? data.images : [];
      return {
        id: f.replace(/\.md$/, ""),
        date: data.date != null ? String(data.date) : "",
        games: data.game != null ? (Array.isArray(data.game) ? data.game : [String(data.game)]) : [],
        friends: Array.isArray(data.friends) ? data.friends : [],
        images: images.map((name) => {
          const base = String(name).replace(/\.[^.]+$/, ""); // 去扩展名当说明
          return {
            src: `/memories/${name}`,
            caption: base,
            ...readDims(path.join(memoriesDir, String(name))),
          };
        }),
        body: content.trim(),
      };
    })
    .sort((a, b) => {
      if (a.date === b.date) return a.id < b.id ? 1 : -1; // 同日按文件名倒序
      if (!a.date) return 1; // 没写日期的沉底
      if (!b.date) return -1;
      return a.date < b.date ? 1 : -1; // YYYY-MM-DD 字符串倒序 = 新的在前
    });
}
