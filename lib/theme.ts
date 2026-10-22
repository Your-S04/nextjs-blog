/**
 * 主题逻辑(单一事实来源):主题列表、切换、持久化、防白闪脚本。
 * 无 React 依赖;ThemePicker 组件和 layout 的内联脚本都消费这里。
 */

export type ThemeId = "light" | "dark" | "t-sepia" | "ocean" | "system";
/** 不需要挂类的主题(light 是 :root 默认)
 *  命名避坑:主题类名不能和 Tailwind 工具类同名(滤镜类就是一个先例) */
const THEME_CLASSES = ["dark", "t-sepia", "ocean"] as const;
const STORAGE_KEY = "kiyone-theme";

/** 主题清单:swatch 三色用于选择器的色块(背景/表面/强调) */
export const THEMES: {
  id: ThemeId;
  label: string;
  swatch: [string, string, string];
}[] = [
  { id: "light", label: "亮色", swatch: ["#ffffff", "#f3f4f6", "#2563eb"] },
  { id: "dark", label: "暗色", swatch: ["#0b0f19", "#1f2937", "#3b82f6"] },
  { id: "t-sepia", label: "墨纸", swatch: ["#f5efe3", "#ece3cf", "#8f6218"] },
  { id: "ocean", label: "深海", swatch: ["#0f1b2d", "#1a2c47", "#38bdf8"] },
  { id: "system", label: "跟随系统", swatch: ["#ffffff", "#0b0f19", "#2563eb"] },
];

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && THEMES.some((t) => t.id === v);
}

/** system 解析成具体主题 */
export function resolveTheme(id: ThemeId): Exclude<ThemeId, "system"> {
  if (id !== "system") return id;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** 应用主题:换 <html> 类 + 写 localStorage */
export function applyTheme(id: ThemeId): void {
  const resolved = resolveTheme(id);
  const el = document.documentElement;
  el.classList.remove(...THEME_CLASSES);
  if (resolved !== "light") el.classList.add(resolved);
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* 隐私模式等场景下静默失败 */
  }
  watchSystem(id);
}

export function getStoredTheme(): ThemeId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isThemeId(v) ? v : "system";
  } catch {
    return "system";
  }
}

/* system 模式下跟随系统实时切换(只挂一次监听) */
let systemWatcher: MediaQueryList | null = null;
function watchSystem(current: ThemeId): void {
  if (current !== "system" || systemWatcher) return;
  systemWatcher = window.matchMedia("(prefers-color-scheme: dark)");
  systemWatcher.addEventListener("change", () => {
    if (getStoredTheme() === "system") applyTheme("system");
  });
}

/** 防白闪内联脚本:React 渲染前在 <head> 里执行,设置初始主题类。
 *  逻辑必须与 applyTheme/resolveTheme 保持一致,改这里时同步改上面。 */
export const BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var ok=["light","dark","t-sepia","ocean","system"];if(!t||ok.indexOf(t)===-1){t="system"}if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t!=="light"){document.documentElement.classList.add(t)}}catch(e){}})();`;
