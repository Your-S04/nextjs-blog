---
title: Termux 环境研究 Next.js 的大坑
date: 2026-10-21
tags: [termux, nextjs]
---

### 在 Android 上开发 Next.js 的注意事项:

- 没有原生 SWC 绑定,只能用 WASM 回退
- Turbopack 不可用,需要 `--webpack` ; 发现 Tailwind 从未在 Termux 生效，遂安装 postcss
- `NODE_ENV=production` 会跳过 devDependencies
