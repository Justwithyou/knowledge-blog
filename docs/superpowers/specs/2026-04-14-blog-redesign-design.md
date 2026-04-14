# 博客界面优化设计方案

## 1. 概述

对知识博客进行界面优化，提升技术博客的专业感和个性化体验。

## 2. 字体选择器 (FontSwitcher)

### 位置
导航栏右侧，与 LightDarkSwitch 并排放置

### 交互
- 点击按钮 → 弹出下拉列表 → 每种字体用它自己的字体显示名称（预览效果）
- 选中立即应用，保存到 localStorage

### 字体选项

| ID | 显示名称 | 字体 | 风格定位 |
|---|---|---|---|
| `system` | 系统默认 | Inter / 思源黑体 | 清晰现代，阅读友好 |
| `lishu` | 隶书 | LiSu / 隶书 | 书法韵味，古典气质 |
| `kaikai` | 楷楷 | Kaiti / 楷体 | 端正优雅，书法正楷 |
| `source-code` | 源码 | Source Code Pro | 代码原生，技术感 |
| `merriweather` | 梅里 | Merriweather | 衬线经典，文学气质 |

### 技术实现
- 创建 `src/components/FontSwitcher.svelte`
- 字体同时影响中英文（通过 CSS font-family 变量）
- 存储在 localStorage，key 为 `fontFamily`

## 3. 主题设置

### 移除
- DisplaySettings 中的主题色 (Hue) 滑块
- 主题色数值显示
- 主题色重置按钮

### 保留
- 背景色切换（明亮 / 星空黑）

### 默认值
- 主题默认：**暗色**（深邃黑）
- 背景默认：**星空黑**（`starry-dark`）

## 4. 导航栏布局

```
[Logo]  [链接...]                    [搜索] [字体▼] [主题▼] [菜单]
```

- FontSwitcher 和 LightDarkSwitch 并排
- DisplaySettings 图标按钮保留（用于背景色设置）

## 5. GitHub 链接更新

所有 GitHub 链接更新为：`https://github.com/Justwithyou/knowledge-blog`

涉及位置：
- `src/config.ts` - navBarConfig.links
- `src/config.ts` - profileConfig.links

## 6. 移除 License 组件

从 `src/pages/posts/[...slug].astro` 中移除 License 组件的引用。

## 7. 星空黑主题（已存在）

确保默认使用深邃黑：
```css
:root.starry-dark
  --page-bg: oklch(0.10 0.015 250)
  --text-color: oklch(0.92 0.01 250)
```

## 8. 实现步骤

1. 创建 FontSwitcher.svelte 组件
2. 更新 Navbar.astro 添加 FontSwitcher
3. 更新 DisplaySettings.svelte 移除主题色相关
4. 更新 setting-utils.ts 添加新字体选项
5. 更新 config.ts 的 GitHub 链接
6. 更新 PostPage.astro 移除 License
7. 验证默认主题为暗色

## 9. 验收标准

- [ ] 字体选择器显示在导航栏
- [ ] 每种字体用自身字体预览
- [ ] 暗色主题默认启用
- [ ] 主题色滑块已移除
- [ ] GitHub 链接已更新
- [ ] License 组件已移除
