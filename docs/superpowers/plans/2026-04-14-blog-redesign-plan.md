# 博客界面优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现字体选择器、移除主题色滑块、更新 GitHub 链接、移除 License 组件

**Architecture:** 在导航栏添加 FontSwitcher 组件（参考 LightDarkSwitch 模式），字体通过 CSS 变量控制，存储在 localStorage

**Tech Stack:** Astro + Svelte + Tailwind CSS + Stylus

---

## 文件变更概览

| 文件 | 操作 |
|------|------|
| `src/components/FontSwitcher.svelte` | 新建 |
| `src/utils/setting-utils.ts` | 修改 |
| `src/styles/variables.styl` | 修改 |
| `src/components/Navbar.astro` | 修改 |
| `src/components/widget/DisplaySettings.svelte` | 修改 |
| `src/config.ts` | 修改 |
| `src/pages/posts/[...slug].astro` | 修改 |

---

## Task 1: 修改默认主题为暗色

**Files:**
- Modify: `src/constants/constants.ts`

- [ ] **Step 1: 将 DEFAULT_THEME 从 AUTO_MODE 改为 DARK_MODE**

在 `src/constants/constants.ts` 中：

```typescript
export const DEFAULT_THEME = DARK_MODE;  // 原来是 AUTO_MODE
```

- [ ] **Step 2: 提交**

```bash
git add src/constants/constants.ts
git commit -m "feat: set default theme to dark mode"
```

---

## Task 2: 添加新字体选项到 setting-utils.ts

**Files:**
- Modify: `src/utils/setting-utils.ts`

- [ ] **Step 1: 更新 FONT_OPTIONS 和 FONT_NAMES**

在 `src/utils/setting-utils.ts` 中找到现有的 FONT_OPTIONS 和 FONT_NAMES，替换为：

```typescript
// Font family options
export const FONT_OPTIONS = ["system", "lishu", "kaikai", "source-code", "merriweather"];
export const FONT_NAMES: Record<string, string> = {
  system: "系统默认",
  lishu: "隶书",
  kaikai: "楷楷",
  "source-code": "源码",
  merriweather: "梅里",
};
```

- [ ] **Step 2: 运行 lint 检查**

Run: `pnpm lint`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/utils/setting-utils.ts
git commit -m "feat: update font options with 5 style presets"
```

---

## Task 2: 添加新字体变量到 variables.styl

**Files:**
- Modify: `src/styles/variables.styl`

- [ ] **Step 1: 更新字体变量定义**

在 `src/styles/variables.styl` 中找到字体定义部分（约第 139-159 行），替换为：

```stylus
/* Font families */
:root
  --font-sans: 'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif
  --font-serif: 'Merriweather', 'Noto Serif SC', Georgia, serif
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace
  --font-poppins: 'Poppins', 'Noto Sans SC', sans-serif
  --font-source-han: 'Source Han Sans', 'Noto Sans SC', sans-serif
  /* New font options */
  --font-lishu: 'LiSu', 'STLiti', 'FangSong', serif
  --font-kaikai: 'KaiTi', 'STKaiti', '楷体', serif
  --font-source-code: 'Source Code Pro', 'JetBrains Mono', monospace
  --font-merriweather: 'Merriweather', 'Noto Serif SC', Georgia, serif

:root.font-sans
  --font-body: var(--font-sans)
:root.font-serif
  --font-body: var(--font-serif)
:root.font-mono
  --font-body: var(--font-mono)
:root.font-poppins
  --font-body: var(--font-poppins)
:root.font-source-han
  --font-body: var(--font-source-han)
/* New font classes */
:root.font-system
  --font-body: var(--font-sans)
:root.font-lishu
  --font-body: var(--font-lishu)
:root.font-kaikai
  --font-body: var(--font-kaikai)
:root.font-source-code
  --font-body: var(--font-source-code)
:root.font-merriweather
  --font-body: var(--font-merriweather)

body
  font-family: var(--font-body, var(--font-sans))
```

- [ ] **Step 2: 提交**

```bash
git add src/styles/variables.styl
git commit -m "feat: add lishu, kaikai, source-code, merriweather font options"
```

---

## Task 3: 创建 FontSwitcher.svelte 组件

**Files:**
- Create: `src/components/FontSwitcher.svelte`

- [ ] **Step 1: 创建 FontSwitcher.svelte**

参考 `LightDarkSwitch.svelte` 的模式，创建 `FontSwitcher.svelte`：

```svelte
<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { FONT_OPTIONS, FONT_NAMES, getFontFamily, setFontFamily } from "@utils/setting-utils";

let currentFont = $state(getFontFamily());

function selectFont(font: string) {
  currentFont = font;
  setFontFamily(font);
  hidePanel();
}

function showPanel() {
  const panel = document.querySelector("#font-panel");
  panel?.classList.remove("float-panel-closed");
}

function hidePanel() {
  const panel = document.querySelector("#font-panel");
  panel?.classList.add("float-panel-closed");
}

function getFontFamilyForPreview(fontId: string): string {
  const fontMap: Record<string, string> = {
    system: "'Inter', 'Noto Sans SC', sans-serif",
    lishu: "'LiSu', 'STLiti', 'FangSong', serif",
    kaikai: "'KaiTi', 'STKaiti', '楷体', serif",
    "source-code": "'Source Code Pro', 'JetBrains Mono', monospace",
    merriweather: "'Merriweather', 'Noto Serif SC', Georgia, serif"
  };
  return fontMap[fontId] || fontMap.system;
}
</script>

<div class="relative z-50" role="menu" tabindex="-1" onmouseleave={hidePanel}>
    <button 
        aria-label="Font Settings" 
        role="menuitem" 
        class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" 
        id="font-switch"
        onclick={showPanel}
    >
        <Icon icon="material-symbols:text-fields-outline-rounded" class="text-[1.25rem]"></Icon>
    </button>

    <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" >
        <div class="card-base float-panel p-2">
            {#each FONT_OPTIONS as font}
                <button 
                    class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                    class:current-theme-btn={currentFont === font}
                    onclick={() => selectFont(font)}
                    style="font-family: {getFontFamilyForPreview(font)}"
                >
                    <Icon 
                        icon="material-symbols:check-rounded" 
                        class="text-[1.25rem] mr-3 {!Object.is(font, currentFont) ? 'opacity-0' : ''}"
                    ></Icon>
                    {FONT_NAMES[font]}
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    .current-theme-btn {
        background: var(--btn-plain-bg-hover);
    }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/FontSwitcher.svelte
git commit -m "feat: add FontSwitcher component with font preview"
```

---

## Task 4: 更新 Navbar.astro 添加 FontSwitcher

**Files:**
- Modify: `src/components/Navbar.astro`

- [ ] **Step 1: 添加 FontSwitcher 导入和放置**

在 `src/components/Navbar.astro` 中：

1. 添加 FontSwitcher 导入（第 7 行附近）：
```astro
import FontSwitcher from "./FontSwitcher.svelte";
```

2. 在导航栏右侧区域添加 FontSwitcher（LightDarkSwitch 前面）：
```astro
<FontSwitcher client:only="svelte"></FontSwitcher>
<LightDarkSwitch client:only="svelte"></LightDarkSwitch>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/Navbar.astro
git commit -m "feat: add FontSwitcher to navbar"
```

---

## Task 5: 更新 DisplaySettings.svelte 移除主题色

**Files:**
- Modify: `src/components/widget/DisplaySettings.svelte`

- [ ] **Step 1: 移除主题色相关代码**

在 `src/components/widget/DisplaySettings.svelte` 中：

1. 移除第 9-10 行的 hue 相关导入（如果存在）：
```typescript
import { getDefaultHue, getHue, setHue } from "@utils/setting-utils";
```

2. 移除第 9-16 行的 hue 变量声明和相关函数：
```typescript
let hue = getHue();
const defaultHue = getDefaultHue();

function resetHue() {
  hue = getDefaultHue();
}

$: if (hue || hue === 0) {
  setHue(hue);
}
```

3. 移除主题色区块的 HTML（第 34-58 行）：
```html
<!-- Theme Color Section -->
<div class="flex flex-row gap-2 mb-3 items-center justify-between">
    ...
</div>
<div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] ...>
    <input aria-label={i18n(I18nKey.themeColor)} type="range" ...>
</div>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/widget/DisplaySettings.svelte
git commit -m "feat: remove hue slider from DisplaySettings"
```

---

## Task 6: 更新 config.ts 的 GitHub 链接

**Files:**
- Modify: `src/config.ts`

- [ ] **Step 1: 更新 GitHub 链接**

在 `src/config.ts` 中：

1. 更新 navBarConfig.links 中的 GitHub URL（第 49 行）：
```typescript
url: "https://github.com/Justwithyou/knowledge-blog",
```

2. 更新 profileConfig.links 中的 GitHub URL（第 63 行）：
```typescript
url: "https://github.com/Justwithyou/knowledge-blog",
```

- [ ] **Step 2: 提交**

```bash
git add src/config.ts
git commit -m "feat: update GitHub links to Justwithyou/knowledge-blog"
```

---

## Task 7: 移除 PostPage 底部的 License 组件

**Files:**
- Modify: `src/pages/posts/[...slug].astro`

- [ ] **Step 1: 移除 License 引用**

在 `src/pages/posts/[...slug].astro` 中：

1. 移除 License 导入（第 3 行）：
```astro
import License from "@components/misc/License.astro";
```

2. 移除 License 组件渲染（第 109 行）：
```astro
{licenseConfig.enable && <License title={entry.data.title} slug={entry.slug} pubDate={entry.data.published} class="mb-6 rounded-xl license-container onload-animation"></License>}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/posts/[...slug].astro
git commit -m "feat: remove License component from post page"
```

---

## Task 8: 验证构建

- [ ] **Step 1: 运行类型检查**

Run: `pnpm type-check`
Expected: 无错误

- [ ] **Step 2: 运行构建**

Run: `pnpm build`
Expected: 构建成功

- [ ] **Step 3: 运行 lint**

Run: `pnpm lint`
Expected: 无错误

---

## 验收标准检查清单

- [ ] 字体选择器显示在导航栏右侧
- [ ] 每种字体用自身字体预览效果
- [ ] 暗色主题默认启用
- [ ] 主题色滑块已从 DisplaySettings 移除
- [ ] GitHub 链接已更新为 Justwithyou/knowledge-blog
- [ ] License 组件已从文章页面移除
- [ ] `pnpm build` 构建成功
