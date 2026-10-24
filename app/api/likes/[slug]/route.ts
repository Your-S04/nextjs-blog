import { NextResponse } from "next/server";
import { createClient } from "@libsql/client/web";
import { getSessionUser } from "@/lib/auth";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

type Ctx = { params: Promise<{ slug: string }> };

/* 点赞状态:总数 + 当前用户是否已赞(未登录 liked 恒为 false) */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const user = await getSessionUser();

  const countR = await client.execute({
    sql: "SELECT COUNT(*) AS n FROM likes WHERE post_slug = ?",
    args: [slug],
  });
  const count = Number(countR.rows[0]?.n ?? 0);

  let liked = false;
  if (user) {
    const mine = await client.execute({
      sql: "SELECT 1 FROM likes WHERE post_slug = ? AND user_id = ?",
      args: [slug, user.id],
    });
    liked = mine.rows.length > 0;
  }

  return NextResponse.json(
    { count, liked },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/* 点赞/取消赞(toggle):需登录;一人一赞,重复点 = 取消 */
export async function POST(_req: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "登录后才能点赞" }, { status: 401 });
  }
  const { slug } = await params;

  const del = await client.execute({
    sql: "DELETE FROM likes WHERE post_slug = ? AND user_id = ?",
    args: [slug, user.id],
  });
  const cancelled = (del.rowsAffected ?? 0) > 0;

  if (!cancelled) {
    await client.execute({
      sql: "INSERT INTO likes (post_slug, user_id) VALUES (?, ?)",
      args: [slug, user.id],
    });
  }

  const countR = await client.execute({
    sql: "SELECT COUNT(*) AS n FROM likes WHERE post_slug = ?",
    args: [slug],
  });

  return NextResponse.json({
    liked: !cancelled,
    count: Number(countR.rows[0]?.n ?? 0),
  });
}
