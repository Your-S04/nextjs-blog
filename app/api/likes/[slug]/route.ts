import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";


type Ctx = { params: Promise<{ slug: string }> };

/* 点赞状态:总数 + 当前用户是否已赞(未登录 liked 恒为 false) */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const user = await getSessionUser();

  const countR = await db().execute({
    sql: "SELECT COUNT(*) AS n FROM likes WHERE post_slug = ?",
    args: [slug],
  });
  const count = Number(countR.rows[0]?.n ?? 0);

  let liked = false;
  if (user) {
    const mine = await db().execute({
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

  const del = await db().execute({
    sql: "DELETE FROM likes WHERE post_slug = ? AND user_id = ?",
    args: [slug, user.id],
  });
  const cancelled = (del.rowsAffected ?? 0) > 0;

  if (!cancelled) {
    /* ON CONFLICT DO NOTHING:并发双击时两个请求都会走到这里,
       UNIQUE(post_slug, user_id) 保证最终最多一赞 —— 晚到的 INSERT
       被静默忽略,但行(对方插的)已存在,liked 返回 true 仍与事实一致 */
    await db().execute({
      sql: `INSERT INTO likes (post_slug, user_id) VALUES (?, ?)
            ON CONFLICT DO NOTHING`,
      args: [slug, user.id],
    });
  }

  const countR = await db().execute({
    sql: "SELECT COUNT(*) AS n FROM likes WHERE post_slug = ?",
    args: [slug],
  });

  return NextResponse.json({
    liked: !cancelled,
    count: Number(countR.rows[0]?.n ?? 0),
  });
}
