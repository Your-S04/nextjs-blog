import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/* 当前登录状态 */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
