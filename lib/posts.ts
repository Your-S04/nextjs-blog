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
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), "utf8");
  const { data, content } = parseFrontmatter(raw);
  return { meta: { ...data, slug }, content };
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
    .sort((a, b) => b.posts[0].date.localeCompare(a.posts[0].date));
}
