---
title: Markdown 写法手册
date: 2026-10-22
tags: [markdown, guide]
---

本站文章放在 `content/posts/` 下,文件名(去掉 `.md`)就是访问地址里的 slug,例如 `hello-termux.md` 对应 `/posts/hello-termux`。列表按 `date` 倒序排列,日期请写 `YYYY-MM-DD`。

## 一、Frontmatter(文件头元数据)

文件必须以独立的 `---` 行开头,再以独立的 `---` 行结束,中间每行一个 `键: 值`:

````markdown
---
title: 文章标题
date: 2026-10-22
tags: [nextjs, termux]
---

正文从这里开始……
````

三个被页面使用的字段:

- `title`:字符串,如 `title: 我的文章`;缺省时用 slug 兜底
- `date`:字符串,如 `date: 2026-10-22`;缺省时为空,排序会沉底
- `tags`:字符串数组,**必须写方括号**,如 `tags: [a, b, c]`;缺省时为空数组(不显示标签)

解析规则细节:

- 每行第一个冒号是键值分隔符,值里可以再含冒号
- 值以 `[` 开头、`]` 结尾时按逗号拆成数组,每项自动去首尾空格和成对引号
- 普通字符串值的首尾成对 `"` 或 `'` 会被剥掉
- 写成 `tags: nextjs`(无括号)会被当成字符串,页面视为没有标签;`tag:` 这个键无效,没有别名兼容
- 除以上三个字段外的自定义键会被解析保存,但页面目前不显示
- 没有 frontmatter 也能发布:标题用 slug、日期为空、无标签
- 不支持:多行值、嵌套结构、YAML 注释、数字/布尔自动转型
- 头部区域内出现 `---` 行即视为头部结束,所以头部里不要写 `---`

## 二、正文语法(支持)

正文由 react-markdown 渲染,支持 CommonMark 标准语法。行内代码灰底圆角,代码块深色底、可横向滚动,列表自动缩进。

````markdown
# 一级标题(页面里 h1 已被文章标题占用,建议从 ## 开始)
## 二级标题
### 三级标题(最多到 ######)

普通段落,段落之间空一行。

*斜体*  _斜体2_   **粗体**   __粗体2__   ***粗斜体***

`行内代码`

- 无序列表
- 第二项
  - 嵌套项(缩进两个空格)

1. 有序列表
2. 第二项

> 引用块
> 可以多行

[链接文字](https://example.com)

![图片描述](/images/foo.png)

<https://auto.link>

---

围栏代码块,``` 后面的语言名会输出为 language-xxx,目前没有语法高亮插件,只是标记。
````

## 三、正文语法(不支持)

- **表格**:`| a | b |` 语法会按普通文本渲染
- **删除线**:`~~文字~~` 不生效
- **任务列表**:`- [x]` 的方括号会原样显示
- **脚注**:`[^1]`
- **裸网址自动成链**:必须用 `<url>` 或 `[文字](url)`
- **内嵌 HTML 标签**:出于安全默认过滤,写了也不渲染

以上都属于 GFM 扩展,安装 `remark-gfm` / `rehype-raw` 后可解锁。

## 四、完整示例

````markdown
---
title: 在 Termux 上跑 Next.js
date: 2026-10-21
tags: [termux, nextjs]
---

在 Android 上开发 Next.js 的注意事项:

- 没有原生 SWC 绑定,只能用 WASM 回退
- Turbopack 不可用,需要 `--webpack`

## 遇到的坑

`NODE_ENV=production` 会跳过 devDependencies。

```ts
console.log("hello from termux");
```
````

## 五、速查

- 文件位置:`content/posts/<slug>.md`
- 头部三件套:`title:`、`date: YYYY-MM-DD`、`tags: [a, b]`
- 标题从 `##` 用起
- 正文 = CommonMark;表格、删除线、任务列表、HTML 均不可用
