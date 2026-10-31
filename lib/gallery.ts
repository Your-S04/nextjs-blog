import fs from "fs";
import path from "path";
import { imageSize } from "image-size";

/* 摄影图集数据:扫描 public/photos/ 目录,零配置 ——
   直接把图片丢进去即可,子文件夹名 = 分组名(避免空格和特殊符号)。
   文件名(去掉扩展名)= 说明文字,推荐日期前缀命名(2026-10-20-黄昏.jpg),
   同组内按文件名倒序排列,新图自然排前面。构建期读取,页面全静态。
   顺带读出图片尺寸,给 next/image 做免裁切的优化缩略图。 */

const photosDir = path.join(process.cwd(), "public", "photos");
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

/* 读图片宽高(纯 JS 解析头部,不加载整张图);失败给保底比例防布局塌 */
function readDims(abs: string): { width: number; height: number } {
  try {
    const d = imageSize(fs.readFileSync(abs));
    return { width: d.width ?? 800, height: d.height ?? 600 };
  } catch {
    return { width: 800, height: 600 };
  }
}

export type GalleryPhoto = {
  src: string;
  caption: string;
  width: number;
  height: number;
};
export type GalleryGroup = { name: string; photos: GalleryPhoto[] };

export function getGalleryGroups(): GalleryGroup[] {
  if (!fs.existsSync(photosDir)) return [];

  const photos: { src: string; caption: string; group: string; width: number; height: number }[] = [];
  const walk = (dir: string, rel: string, group: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const relNext = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        walk(path.join(dir, ent.name), relNext, ent.name);
      } else if (EXTS.has(path.extname(ent.name).toLowerCase())) {
        photos.push({
          src: `/photos/${relNext}`,
          caption: path.basename(ent.name, path.extname(ent.name)),
          group,
          ...readDims(path.join(dir, ent.name)),
        });
      }
    }
  };
  walk(photosDir, "", "ALL"); // 根目录的散图归入 ALL 组

  const groups = new Map<string, GalleryPhoto[]>();
  for (const p of photos) {
    if (!groups.has(p.group)) groups.set(p.group, []);
    groups.get(p.group)!.push({ src: p.src, caption: p.caption, width: p.width, height: p.height });
  }
  return [...groups.entries()]
    .map(([name, list]) => ({
      name,
      photos: list.sort((a, b) => (a.src < b.src ? 1 : -1)), // 文件名倒序 = 新图在前
    }))
    .sort((a, b) =>
      a.name === "ALL" ? -1 : b.name === "ALL" ? 1 : a.name.localeCompare(b.name, "zh"),
    );
}
