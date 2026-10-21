import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");

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
      const { data } = matter(fs.readFileSync(path.join(postsDir, f), "utf8"));
      return {
        slug,
        title: data.title ?? slug,
        date: String(data.date ?? ""),
        tags: data.tags ?? [],
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
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
