# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Use **pnpm** exclusively (enforced via preinstall hook). Do not use npm or yarn.

## Common Commands

```bash
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Build to ./dist/ and run pagefind indexing
pnpm preview      # Preview production build locally
pnpm check        # Astro type checking
pnpm type-check   # TypeScript type checking (tsc --noEmit)
pnpm lint         # Biome linter
pnpm format       # Biome formatter
pnpm new-post <filename>  # Scaffold a new blog post in src/content/posts/
```

## Architecture

**Astro** static site generator with **Svelte** for interactive components and **Tailwind CSS** for styling. Content lives in `src/content/posts/` as Markdown files.

### Key layers

- **`src/config.ts`** — Central site configuration (title, profile, navbar, theme, license). This is the main file to customize for a new blog instance.
- **`src/types/config.ts`** — TypeScript types for config options.
- **`src/content/posts/`** — Markdown blog posts with frontmatter (`title`, `published`, `description`, `image`, `tags`, `category`, `draft`, `lang`).
- **`src/pages/`** — Astro pages: index (paginated), `/archive/`, `/about/`, `/rss.xml`.
- **`src/layouts/`** — `Layout.astro` (base HTML shell) and `MainGridLayout.astro` (two-column layout with sidebar).
- **`src/components/`** — Divided into `control/` (interactive UI), `misc/` (content helpers), and `widget/` (sidebar widgets). Most widgets are `.astro`; theme/search/display components are `.svelte`.
- **`src/plugins/`** — Custom remark/rehype plugins: admonitions (`:::note`), GitHub card embeds, reading time, excerpt extraction, and Expressive Code extensions.
- **`src/i18n/`** — i18n keys and translations for 10+ languages. UI strings go through `translation.ts`.
- **`src/constants/`** — Page size, theme modes, banner heights, layout widths.

### Path aliases (tsconfig.json)

| Alias | Maps to |
|-------|---------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@assets/*` | `src/assets/*` |
| `@constants/*` | `src/constants/*` |
| `@utils/*` | `src/utils/*` |
| `@i18n/*` | `src/i18n/*` |
| `@layouts/*` | `src/layouts/*` |

### Styling

Tailwind CSS with class-based dark mode. Additional styling uses **Stylus** (`src/styles/variables.styl`, `markdown-extend.styl`). PostCSS handles nesting.

### Search

Pagefind runs after `pnpm build` to index the `./dist/` output. The search index is not available during `pnpm dev`.

### Code formatting/linting

Biome handles JS/TS/Svelte/Astro files. Tabs for indentation, double quotes. CSS files are excluded from Biome and handled separately.

## CI

GitHub Actions runs `astro check` + `astro build` on Node 22/23, and Biome lint — both triggered on push/PR to main.
