import { createClient } from "@libsql/client/web";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/* 1. 连通性 */
const ping = await client.execute("SELECT 1 AS ok");
console.log("✓ 连接成功:", JSON.stringify(ping.rows[0]));

/* 2. 建表(阶段 0/2/3/4 的地基) */
await client.execute(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
await client.execute(`CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL
)`);
await client.execute(`CREATE TABLE IF NOT EXISTS visits (
  day TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
)`);
await client.execute(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
await client.execute(`CREATE TABLE IF NOT EXISTS likes (
  post_slug TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id)
)`);
/* 访客 IP 去重:/api/visits 的 INSERT ON CONFLICT DO NOTHING 依赖此主键 */
await client.execute(`CREATE TABLE IF NOT EXISTS visit_ips (
  ip TEXT NOT NULL,
  day TEXT NOT NULL,
  PRIMARY KEY (ip, day)
)`);
/* 一人一赞:点赞接口的并发安全依赖这条唯一约束。
   已有库也能补建;若报 duplicate 错误,说明存量有重复赞,需先去重 */
await client.execute(
  `CREATE UNIQUE INDEX IF NOT EXISTS likes_post_user ON likes (post_slug, user_id)`,
);
/* 评论列表按 slug 倒序、限流按 user 查最近一条,各建一个覆盖索引 */
await client.execute(
  `CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments (post_slug, created_at)`,
);
await client.execute(
  `CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (user_id, created_at)`,
);
console.log("✓ users / sessions / visits / comments / likes / visit_ips 表已就绪");

/* 3. 确认 */
const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
);
console.log("当前表:", tables.rows.map((r) => r.name).join(", "));
