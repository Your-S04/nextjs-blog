/**
 * 跨平台依赖保活:本项目在 Termux(android)与 Debian 容器(linux)两套环境
 * 共享同一个 node_modules,但 npm 会按当前平台过滤 optionalDependencies,
 * 把"不属于本平台"的手动安装目录当作多余文件清掉。
 *
 * vendor/ 里收录了 linux-arm64 的两个原生绑定 tarball(它们被 Termux 的
 * npm 拒装),此脚本在每次 npm install 后把缺失的包解包回 node_modules。
 * 幂等:已存在则跳过。
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const nm = path.join(root, "..", "node_modules");
const vendor = path.join(root, "..", "vendor");

const bindings = [
  {
    tarball: "lightningcss-linux-arm64-gnu-1.32.0.tgz",
    dest: path.join(nm, "lightningcss-linux-arm64-gnu"),
  },
  {
    tarball: "tailwindcss-oxide-linux-arm64-gnu-4.3.3.tgz",
    dest: path.join(nm, "@tailwindcss", "oxide-linux-arm64-gnu"),
  },
  {
    tarball: "libsql-linux-arm64-gnu-0.5.29.tgz",
    dest: path.join(nm, "@libsql", "linux-arm64-gnu"),
  },
  {
    tarball: "esbuild-linux-arm64-0.25.12.tgz",
    dest: path.join(nm, "@esbuild", "linux-arm64"),
  },
];

for (const { tarball, dest } of bindings) {
  if (fs.existsSync(dest)) continue;
  const tmp = fs.mkdtempSync(path.join(nm, ".tmp-binding-"));
  execSync(`tar -xzf "${path.join(vendor, tarball)}" -C "${tmp}"`, { stdio: "pipe" });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(path.join(tmp, "package"), dest);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`[ensure-bindings] restored ${path.relative(path.join(root, ".."), dest)}`);
}
