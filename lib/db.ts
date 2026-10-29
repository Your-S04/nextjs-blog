import { createClient } from "@libsql/client/web";

/* Turso 客户端(全站唯一事实来源):惰性初始化 ——
   构建期(页面数据收集)只导入不连接,本机缺 TURSO_* 环境变量也能 build;
   首次真正触库时才校验配置。lib/auth.ts 与全部 /api 路由共用。 */
let _client: ReturnType<typeof createClient> | null = null;

export function db() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return _client;
}
