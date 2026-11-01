import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {
        root: import.meta.dirname,
    },
    images: {
        /* 收敛尺寸档位:变体越少,优化缓存命中率越高,首次访问也不卡 */
        deviceSizes: [640, 828, 1080, 1200, 1920],
        imageSizes: [64, 96, 160, 256, 384, 512],
        minimumCacheTTL: 2678400, /* 优化结果缓存 31 天 */
    },
};

export default nextConfig;
