import fs from "fs";
import path from "path";

const postsDir = path.join(process.cwd(), "content/posts");

function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>;
  content: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, content: raw };
  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""))
        : [];
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { data, content: raw.slice(match[0].length) };
}

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
};

/**
 * 日期排序键:越大越新。
 * 只支持两种写法:
 *   2026-10-22 [08:30]   现代日期(月、日、时间可省略)
 *   44 BCE [-03-15]      公元前(月、日可省略;天文纪年:公元前 n 年 = -(n-1))
 * 其余写法(含空串)→ -Infinity,永远排在最后。
 */
function dateSortKey(raw: string): number {
  const s = raw.trim();
  const bce = /^(\d{1,4}) BCE(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(s);
  if (bce) {
    return toKey(
      -(parseInt(bce[1], 10) - 1),
      bce[2],
      bce[3],
    );
  }
  const ce = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?(?:[T ](\d{1,2}):(\d{2}))?$/.exec(
    s,
  );
  if (ce) {
    return toKey(parseInt(ce[1], 10), ce[2], ce[3], ce[4], ce[5]);
  }
  return -Infinity;
}

function toKey(
  year: number,
  month?: string,
  day?: string,
  hour?: string,
  minute?: string,
): number {
  return (
    ((year * 100 + (month ? parseInt(month, 10) : 0)) * 100 +
      (day ? parseInt(day, 10) : 0)) *
      10000 +
    (hour ? parseInt(hour, 10) : 0) * 100 +
    (minute ? parseInt(minute, 10) : 0)
  );
}

export function getAllPosts(): PostMeta[] {
  return fs.readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = parseFrontmatter(fs.readFileSync(path.join(postsDir, f), "utf8"));
      return {
        slug,
        title: data.title != null ? String(data.title) : slug,
        date: data.date != null ? String(data.date) : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    })
    .sort((a, b) => dateSortKey(b.date) - dateSortKey(a.date));
}

export function getPost(slug: string): { meta: PostMeta; content: string } {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), "utf8");
  const { data, content } = parseFrontmatter(raw);
  return {
    meta: {
      slug,
      title: data.title != null ? String(data.title) : slug,
      date: data.date != null ? String(data.date) : "",
      tags: Array.isArray(data.tags) ? data.tags : [],
    },
    content,
  };
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  getAllPosts().forEach((p) => p.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}

export function getPostsGroupedByTag() {
  const posts = getAllPosts();
  const groups = new Map<string, PostMeta[]>();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag)!.push(post);
    }
  }
  return [...groups.entries()]
    .map(([tag, posts]) => ({ tag, posts }))
    .sort((a, b) => dateSortKey(b.posts[0].date) - dateSortKey(a.posts[0].date));
}
