# 技术漫客

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

> 技术分享 · 知识沉淀 · 持续成长

基于 [Fuwari](https://github.com/saicaca/fuwari) 模板构建的个人技术博客，使用 [Astro](https://astro.build) + [Tailwind CSS](https://tailwindcss.com) + [Svelte](https://svelte.dev) 开发。

## ✨ 特性

- 基于 Astro 构建的静态博客，加载快速
- 亮色 / 暗色主题切换，支持自定义主题色
- 平滑动画与页面过渡效果
- 全文搜索（[Pagefind](https://pagefind.app/)）
- 文章目录（TOC）自动生成
- RSS 订阅支持
- 响应式布局，移动端友好
- Markdown 扩展语法（告警块、GitHub 卡片、增强代码块）

## 🚀 本地开发

**环境要求**：Node.js >= 20，pnpm >= 9

```bash
# 安装依赖
pnpm install

# 启动开发服务器 http://localhost:4321
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📝 写新文章

```bash
pnpm new-post <文件名>
```

文章位于 `src/content/posts/`，支持以下 frontmatter：

```yaml
---
title: 文章标题
published: 2025-01-01
description: 文章简介
image: ./cover.jpg       # 可选封面图
tags: [标签1, 标签2]
category: 分类名称
draft: false             # true 则为草稿，不会发布
lang: zh_CN              # 可选，仅在与站点语言不同时设置
---
```

## ⚙️ 站点配置

编辑 `src/config.ts` 可修改站点标题、作者信息、导航栏、主题色等全局配置。

## 🔧 其他命令

| 命令 | 说明 |
|:-----|:-----|
| `pnpm check` | Astro 类型检查 |
| `pnpm type-check` | TypeScript 类型检查 |
| `pnpm lint` | Biome 代码检查 |
| `pnpm format` | Biome 代码格式化 |

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。博客内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。
