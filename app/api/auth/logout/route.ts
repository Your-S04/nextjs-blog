import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

/* 登出:删会话 + 清 Cookie */
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
