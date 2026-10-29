import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";


/* 注册:用户名 2-16 位(字母/数字/下划线/中文),密码 6-72 位 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = body.username;
  const password = body.password;

  if (
    typeof username !== "string" ||
    !/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,16}$/.test(username)
  ) {
    return NextResponse.json(
      { error: "用户名需 2-16 位(字母/数字/下划线/中文)" },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length < 6 || password.length > 72) {
    return NextResponse.json({ error: "密码需 6-72 位" }, { status: 400 });
  }

  const dup = await db().execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [username],
  });
  if (dup.rows.length > 0) {
    return NextResponse.json({ error: "用户名已被占用" }, { status: 409 });
  }

  const hash = await hashPassword(password);
  const r = await db().execute({
    sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    args: [username, hash],
  });
  const userId = Number(r.lastInsertRowid);

  await createSession(userId); // 注册即登录
  return NextResponse.json({ user: { id: userId, username } });
}
