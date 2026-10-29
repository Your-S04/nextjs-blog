import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";


type Ctx = { params: Promise<{ slug: string }> };

/* 评论列表:联 users 取用户名,时间倒序 */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await db().execute({
    sql: `SELECT c.id, c.content, c.created_at, u.username
          FROM comments c JOIN users u ON u.id = c.user_id
          WHERE c.post_slug = ?
          ORDER BY c.created_at DESC, c.id DESC`,
    args: [slug],
  });

  const comments = r.rows.map((row) => ({
    id: Number(row.id),
    username: String(row.username),
    content: String(row.content),
    createdAt: String(row.created_at),
  }));

  return NextResponse.json(
    { comments },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/* 发表评论:需登录;内容 1-500 字,纯文本存储(渲染走 React 文本节点,天然防 XSS) */
export async function POST(req: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "登录后才能评论" }, { status: 401 });
  }
  const { slug } = await params;

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 1 || content.length > 500) {
    return NextResponse.json({ error: "评论需 1-500 字" }, { status: 400 });
  }

  /* 简易限流:同一用户 30 秒内只允许发一条 */
  const recent = await db().execute({
    sql: `SELECT id FROM comments
          WHERE user_id = ? AND created_at > datetime('now', '-30 seconds')`,
    args: [user.id],
  });
  if (recent.rows.length > 0) {
    return NextResponse.json(
      { error: "发送太频繁,稍后再试" },
      { status: 429 },
    );
  }

  const r = await db().execute({
    sql: "INSERT INTO comments (post_slug, user_id, content) VALUES (?, ?, ?)",
    args: [slug, user.id, content],
  });

  return NextResponse.json({
    comment: {
      id: Number(r.lastInsertRowid),
      username: user.username,
      content,
      createdAt: new Date().toISOString(),
    },
  });
}
