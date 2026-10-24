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
console.log("✓ users / sessions / visits 表已就绪");

/* 3. 确认 */
const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
);
console.log("当前表:", tables.rows.map((r) => r.name).join(", "));
