import { NextResponse } from "next/server";
import { createClient } from "@libsql/client/web";
import { verifyPassword, createSession } from "@/lib/auth";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

/* 登录:用户名 + 密码 → 会话 Cookie */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = body.username;
  const password = body.password;

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "缺少用户名或密码" }, { status: 400 });
  }

  const r = await client.execute({
    sql: "SELECT id, password_hash FROM users WHERE username = ?",
    args: [username],
  });
  const row = r.rows[0];
  const hash = typeof row?.password_hash === "string" ? row.password_hash : null;

  /* 用户不存在与密码错误返回同一句话,不泄露用户名是否存在 */
  if (!row || !hash || !(await verifyPassword(password, hash))) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  await createSession(Number(row.id));
  return NextResponse.json({ user: { id: Number(row.id), username } });
}
