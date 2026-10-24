import { NextResponse } from "next/server";
import { createClient } from "@libsql/client/web";

/* 访客计数:存 Turso 云库(阶段 1 迁移)。
   环境变量来自 .env.local(本地)/ Vercel 环境变量(线上)。
   去重:visit_ips 表记录 (ip, day) —— 同一 IP 每天只计一次。 */
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(request: Request) {
  const today = new Date().toISOString().slice(0, 10);

  /* 真实客户端 IP:Vercel 代理会写入 x-forwarded-for(取第一个);
     本地开发通常是 127.0.0.1 */
  const ip = (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
    .split(",")[0]
    .trim();

  try {
    /* 首次见到的 IP 才计数:INSERT OR IGNORE 的 rowsAffected 区分新旧访客 */
    const inserted = await client.execute({
      sql: `INSERT INTO visit_ips (ip, day) VALUES (?, ?)
            ON CONFLICT DO NOTHING`,
      args: [ip, today],
    });
    const isNew = (inserted.rowsAffected ?? 0) > 0;

    if (isNew) {
      await client.execute({
        sql: `INSERT INTO visits (day, count) VALUES (?, 1)
              ON CONFLICT(day) DO UPDATE SET count = count + 1`,
        args: [today],
      });
    }

    const totalR = await client.execute(
      "SELECT COALESCE(SUM(count), 0) AS total FROM visits",
    );
    const todayR = await client.execute({
      sql: "SELECT count FROM visits WHERE day = ?",
      args: [today],
    });

    return NextResponse.json(
      {
        total: Number(totalR.rows[0]?.total ?? 0),
        today: Number(todayR.rows[0]?.count ?? 0),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[visits] Turso 错误:", e);
    return NextResponse.json(
      { total: 0, today: 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
