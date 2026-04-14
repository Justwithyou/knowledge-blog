---
title: 使用 Astro 搭建高性能静态博客
published: 2025-01-15
description: 介绍 Astro 框架的核心特性以及为什么它适合构建个人博客和静态网站。
tags: [Astro, 前端, 静态网站]
category: 前端开发
draft: false
---

# 使用 Astro 搭建高性能静态博客

## 什么是 Astro？

Astro 是一个现代的静态站点生成器（SSG），专为内容驱动的网站设计。它的核心理念是 **"Islands Architecture"（岛屿架构）** —— 默认情况下所有页面都是零 JavaScript 的静态 HTML，只有在需要交互的地方才加载对应的 JavaScript。

## 为什么选择 Astro 搭建博客？

### 1. 默认零 JavaScript

与 React 或 Next.js 不同，Astro 默认输出的页面不包含任何 JavaScript。这意味着：

- 更快的首屏加载速度
- 更低的带宽消耗
- 更好的 SEO 表现

### 2. 多框架支持

Astro 支持在同一个项目中混用多种 UI 框架：

```astro
---
import ReactComponent from './ReactComponent.jsx';
import VueComponent from './VueComponent.vue';
import SvelteComponent from './SvelteComponent.svelte';
---

<ReactComponent client:load />
<VueComponent client:visible />
<SvelteComponent />
```

### 3. 内容集合（Content Collections）

Astro 提供了强大的内容管理功能：

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    published: z.date(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
```

### 4. Markdown 支持

原生支持 Markdown 和 MDX，可以编写包含组件的动态内容。

## 快速开始

```bash
# 创建新项目
npm create astro@latest my-blog

# 安装依赖
cd my-blog
npm install

# 启动开发服务器
npm run dev
```

## 总结

Astro 凭借其独特的岛屿架构、多框架兼容性和出色的性能表现，已经成为构建个人博客和技术文档的首选方案。无论你是前端新手还是资深开发者，都能快速上手并构建出优秀的网站。
