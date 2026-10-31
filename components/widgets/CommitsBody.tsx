"use client";

import { useCallback, useEffect, useState } from "react";

/* COMMITS. 的内容:GitHub 提交历史(全量)。
   数据来自 GitHub REST API(公开仓库免鉴权,游客 IP 每小时 60 次,
   个人博客流量足够);仓库私有或超限时进入错误态,可点重试。 */

const REPO = "Your-S04/nextjs-blog";
const API_BASE = `https://api.github.com/repos/${REPO}/commits`;
const PER_PAGE = 100; // GitHub 单页条数上限
const REPO_URL = `https://github.com/${REPO}`;

type GhApiCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name: string; date: string } };
};

type Commit = {
  sha: string;
  url: string;
  message: string;
  author: string;
  date: string;
};

/* 全量拉取:单页最多 100 条,按页翻到不足一页为止 */
async function fetchAllCommits(): Promise<GhApiCommit[]> {
  const all: GhApiCommit[] = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`${API_BASE}?per_page=${PER_PAGE}&page=${page}`);
    if (!r.ok) throw new Error(String(r.status));
    const batch = (await r.json()) as GhApiCommit[];
    all.push(...batch);
    if (batch.length < PER_PAGE) return all;
  }
}

/* GitHub 返回 UTC ISO 时间:转本地时区显示(与评论区同一套规则) */
function formatTime(utc: string): string {
  const d = new Date(utc);
  if (Number.isNaN(d.getTime())) return utc; // 解析失败原样兜底
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* inColumn = 停靠展开态(列表占满剩余高度);false = 浮窗态(固定最大高) */
export default function CommitsBody({ inColumn }: { inColumn: boolean }) {
  const [commits, setCommits] = useState<Commit[] | null>(null);
  const [failed, setFailed] = useState(false);

  /* 只发请求不改状态:重置交给调用方(初始挂载天然是空态) */
  const load = useCallback(() => {
    fetchAllCommits()
      .then((d) =>
        setCommits(
          d.map((c) => ({
            sha: c.sha,
            url: c.html_url,
            message: c.commit.message.split("\n")[0], // 只取首行,正文太长
            author: c.commit.author?.name ?? "unknown",
            date: c.commit.author?.date ?? "",
          })),
        ),
      )
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setCommits(null);
    setFailed(false);
    load();
  };

  return (
    <>
      {failed ? (
        <p className="px-3 py-3 text-xs text-faint">
          GitHub 提交历史加载失败(仓库需为公开)·{" "}
          <button type="button" onClick={retry} className="font-bold text-accent hover:underline">
            重试
          </button>
        </p>
      ) : commits === null ? (
        <p className="px-3 py-3 text-xs text-faint">加载中…</p>
      ) : commits.length === 0 ? (
        <p className="px-3 py-3 text-xs text-faint">还没有提交</p>
      ) : (
        <ul className={inColumn ? "min-h-0 flex-1 overflow-y-auto" : "max-h-64 overflow-y-auto"}>
          {commits.map((c) => (
            <li key={c.sha} className="border-b border-border px-3 py-2 last:border-b-0">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-2 block text-xs font-semibold text-foreground hover:text-accent"
              >
                {c.message}
              </a>
              <div className="mt-1 flex items-baseline justify-between gap-2 text-[10px] text-faint">
                <span className="truncate">{c.author}</span>
                <span className="flex shrink-0 items-baseline gap-2">
                  <time>{formatTime(c.date)}</time>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-accent hover:underline"
                  >
                    {c.sha.slice(0, 7)}
                  </a>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0 border-t-2 border-border bg-surface px-3 py-1.5 text-right text-[10px] font-bold text-muted hover:text-accent"
      >
        github.com/{REPO} →
      </a>
    </>
  );
}
