# AI 资讯功能设计

## 概述

在导航栏新增「AI 资讯」菜单项，点击跳转到资讯列表页，页面采用卡片式布局展示每条资讯，卡片整张可点击跳转至来源地址。

## 内容层

### Collection Schema

新建 `src/content/ai-news/config.ts`，定义独立 collection：

```ts
const aiNewsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    published: z.date(),
    description: z.string().optional().default(""),
    source: z.string(),       // 来源名称，如 "量子位"
    sourceUrl: z.string().url(), // 来源链接
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});
```

内容文件放在 `src/content/ai-news/` 目录下，每条资讯一个 `.md` 文件。

### Frontmatter 示例

```markdown
---
title: "Claude 4 发布，编程能力再创新高"
published: 2026-04-16
description: "Anthropic 推出新一代 Claude 4 模型..."
source: "量子位"
sourceUrl: "https://mp.weixin.qq.com/s/xxx"
tags: ["AI", "大模型"]
draft: false
---
```

## 路由层

- 页面组件：`src/pages/ai-news.astro`
- 路由路径：`/ai-news/`
- 列表页直接渲染，卡片整张可点击，跳转至 `sourceUrl`（外链）

## 导航栏集成

在 `src/config.ts` 的 `navBarConfig.links` 中，在 `LinkPreset.Archive`（归档）之前插入：

```ts
{
  name: "AI 资讯",
  url: "/ai-news/",
},
```

## 前端组件

### 页面 `src/pages/ai-news.astro`

- 引入 `getCollection("ai-news")` 获取所有非草稿条目
- 按 `published` 降序排列
- 渲染为卡片列表，卡片点击 `window.open(sourceUrl, "_blank")`

### 复用现有组件

- `MainGridLayout.astro` 作为页面布局
- 复用现有的卡片/列表样式，或新建轻量组件

## 实现步骤

1. 创建 `src/content/ai-news/config.ts` 定义 collection schema
2. 更新 `src/content/config.ts` 引入新 collection
3. 创建 `src/pages/ai-news.astro` 列表页面
4. 更新 `src/config.ts` 在导航栏链接中插入 AI 资讯入口
5. 创建至少一条示例资讯内容文件
