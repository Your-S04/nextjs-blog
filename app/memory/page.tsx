import type { Metadata } from "next";
import { getGalleryGroups } from "@/lib/gallery";
import { getMemories } from "@/lib/memories";
import GalleryGrid from "@/components/GalleryGrid";
import MemoriesTimeline from "@/components/MemoriesTimeline";

export const metadata: Metadata = { title: "记忆" };

/* MEMORY. 页:摄影图集 + 游戏记忆,一页两块,顶部锚点胶囊速览。
   两个区块都是构建期读文件的全静态内容,图片查看共用 Lightbox 灯箱。 */
export default function MemoryPage() {
  const groups = getGalleryGroups();
  const memories = getMemories();
  const photoCount = groups.reduce((n, g) => n + g.photos.length, 0);

  return (
    <div>
      <h1 className="w-fit -skew-x-6 bg-foreground px-4 py-1 text-2xl font-bold font-brand italic text-background shadow-[4px_4px_0_0_var(--shadow)]">
        <span className="inline-block skew-x-6">
          MEMORY<span className="text-background">.</span>
        </span>
      </h1>

      {/* 锚点速览:同页跳转,用普通 <a>(走纱幕转场会整页闪) */}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="#photos"
          className="-skew-x-6 bg-accent px-2.5 py-1 text-xs font-bold text-background"
        >
          <span className="inline-block skew-x-6">PHOTOS. {photoCount}</span>
        </a>
        <a
          href="#games"
          className="-skew-x-6 bg-accent px-2.5 py-1 text-xs font-bold text-background"
        >
          <span className="inline-block skew-x-6">GAME LOG. {memories.length}</span>
        </a>
      </div>

      {/* ===== 摄影图集 ===== */}
      <section id="photos" className="mt-10">
        <h2 className="mb-6 w-fit -skew-x-6 bg-foreground px-3 py-0.5 text-lg font-bold font-brand italic text-background">
          <span className="inline-block skew-x-6">
            PHOTOS<span className="text-background">.</span>
          </span>
        </h2>
        {groups.length === 0 ? (
          <p className="text-faint">
            还没有照片 · 把图片丢进 public/photos/(子文件夹名 = 分组名)即可
          </p>
        ) : (
          <GalleryGrid groups={groups} />
        )}
      </section>

      {/* ===== 游戏记忆 ===== */}
      <section id="games" className="mt-12">
        <h2 className="mb-6 w-fit -skew-x-6 bg-foreground px-3 py-0.5 text-lg font-bold font-brand italic text-background">
          <span className="inline-block skew-x-6">
            GAME LOG<span className="text-background">.</span>
          </span>
        </h2>
        {memories.length === 0 ? (
          <p className="text-faint">
            还没有记录 · 在 content/memories/ 下新建 .md(格式见 lib/memories.ts 顶部注释)
          </p>
        ) : (
          <MemoriesTimeline entries={memories} />
        )}
      </section>
    </div>
  );
}
