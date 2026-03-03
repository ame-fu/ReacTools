## ReacTools

**Developer-focused online tools** — A React/Next.js port of [IT-Tools](https://it-tools.ywsj.eu.org/), built with TypeScript, React 19, Next.js and Ant Design.

ReacTools 是为开发者准备的 **在线工具合集**，基于 [IT-Tools](https://it-tools.ywsj.eu.org/) 用 **React / Next.js / Ant Design** 重新实现。

### 功能亮点

- **多类别工具集合**：编码/解码、格式转换、加密解密、网络、文本、时间日期等常用工具，一站式集中。
- **多语言支持**：内置多语言 i18n，文案来源于 `locales/*.yml`，构建时自动生成消息文件。
- **深浅色主题**：支持亮色/暗色主题切换，卡片、背景、文本等都跟随主题变化。
- **响应式布局**：桌面端有固定侧栏与顶栏，移动端提供全屏菜单，适配不同尺寸设备。
- **收藏工具**：常用工具可一键收藏，方便快速访问。

### 技术栈

- **框架**：Next.js 16（App Router）+ React 19
- **语言**：TypeScript
- **UI**：Ant Design + 自定义组件
- **多语言**：YAML 文本 + 生成脚本 `generate:i18n`

### 本地开发

```bash
# 安装依赖
npm install

# 生成 i18n（从 locales/*.yml）
npm run generate:i18n

# 启动开发环境
npm run dev

# 构建生产包（会先执行 generate:i18n）
npm run build

# 以生产模式运行
npm start
```

### 项目结构概览

- `app/`：Next.js 路由与页面（首页、关于页、工具动态路由等）
- `components/`：布局与通用页面组件（布局、导航、工具卡片等）
- `components/ui/`：通用 UI 组件（如 `CopyButton`、`InputCopyable`、`TextareaCopyable` 等）
- `components/tools/`：每一个具体的小工具组件
- `lib/`：工具配置、i18n、主题切换、收藏状态管理等核心逻辑
- `locales/`：多语言 YAML 文本（`en/zh/de/fr/no/pt/uk/vi` 等）
- `content/articles/`：文章与说明内容（如迁移笔记等）


### 原项目

- **IT-Tools** — https://it-tools.ywsj.eu.org/ 

---

## English

ReacTools is a **collection of online tools for developers**, reimplemented from [IT-Tools](https://it-tools.ywsj.eu.org/) with **React, Next.js and Ant Design** for a modern stack and UX.

### Features

- **Tool categories**: Encode/decode, format conversion, crypto, network, text, date/time and more in one place.
- **i18n**: Multiple languages via `locales/*.yml`; messages are generated at build time.
- **Light/dark theme**: Theme-aware UI; cards, background and text follow the selected theme.
- **Responsive layout**: Fixed sidebar and header on desktop, full-screen menu on mobile.
- **Favorites**: Pin tools for quick access.

### Tech stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **UI**: Ant Design + custom components
- **i18n**: YAML files + `generate:i18n` script

### Development

```bash
# Install dependencies
npm install

# Generate i18n (from locales/*.yml)
npm run generate:i18n

# Start dev server
npm run dev

# Build (runs generate:i18n first)
npm run build

# Run production build
npm start
```

### Project structure

- `app/` — Next.js routes and pages (home, about, tool dynamic routes)
- `components/` — Layout and shared page components
- `components/ui/` — Reusable UI (e.g. CopyButton, InputCopyable, TextareaCopyable)
- `components/tools/` — Individual tool components
- `lib/` — Tool config, i18n, theme, favorites and other core logic
- `locales/` — i18n YAML (en, zh, de, fr, no, pt, uk, vi, etc.)
- `content/articles/` — Articles and docs (e.g. migration notes)

---

### Credits

- **IT-Tools** — https://it-tools.ywsj.eu.org/ 


