import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/* 认证核心:密码哈希(bcryptjs)+ 会话令牌(sessions 表 + httpOnly Cookie)。
   仅服务端使用(route handlers 里)。数据库客户端见 lib/db.ts(惰性初始化)。 */

export const SESSION_COOKIE = "p3_session";
const SESSION_DAYS = 30;

export type SessionUser = { id: number; username: string };

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

/** 建会话:随机令牌入 sessions 表,httpOnly Cookie 下发浏览器。
    secure 标志按请求协议自动判断 —— 本地 http 不启用(Safari 不接受
    localhost 上的 Secure Cookie),Vercel 代理(x-forwarded-proto=https)自动启用 */
export async function createSession(userId: number): Promise<void> {
  /* 顺手清理过期会话(登录不频繁,一次全局 DELETE 换表不膨胀)。
     时间比较统一走 julianday:存量行是 toISOString 的 "T/Z" 格式,
     datetime('now') 是空格格式,字符串直接比在到期日当天会失准 */
  await db().execute(
    "DELETE FROM sessions WHERE julianday(expires_at) <= julianday('now')",
  );
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  await db().execute({
    sql: "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    args: [token, userId, expires],
  });
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
    secure: proto === "https",
  });
}

/** 当前登录用户:Cookie 令牌 → sessions 表(校验过期)→ users */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const r = await db().execute({
    sql: `SELECT u.id, u.username FROM sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.token = ? AND julianday(s.expires_at) > julianday('now')`,
    args: [token],
  });
  const row = r.rows[0];
  if (!row) return null;
  return { id: Number(row.id), username: String(row.username) };
}

/** 登出:删会话记录 + 清 Cookie */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db().execute({
      sql: "DELETE FROM sessions WHERE token = ?",
      args: [token],
    });
  }
  jar.delete(SESSION_COOKIE);
}
