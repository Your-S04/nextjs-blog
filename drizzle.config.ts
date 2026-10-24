import { defineConfig } from "drizzle-kit";

/* Drizzle Studio 配置:密钥从 .env.local 读(不进 git)。
   用法:npm run studio → 浏览器打开 local.drizzle.studio */
export default defineConfig({
    dialect: "turso",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    },
});
