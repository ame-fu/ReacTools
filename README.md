# ReacTools

ReacTools 是基于 [IT-Tools](https://it-tools.ywsj.eu.org/) 的 **React/Next.js 移植版**，为开发者提供常用在线小工具。功能与交互尽量与原版一致，技术栈为 **TypeScript**、**React 19**、**Next.js** 与 **Ant Design**。

## 功能概览

- 与 IT-Tools 对应的多类工具（编解码、转换、加密、网络、文本等）
- 多语言 i18n（基于 `locales/*.yml`，构建时生成）
- 亮色/暗色主题、响应式布局、移动端全屏菜单
- 收藏工具、侧栏与内容区独立滚动、固定顶栏

## 技术栈

- Next.js 16 + React 19
- TypeScript
- Ant Design 组件库
- YAML 多语言（generate:i18n 生成 messages）

## 开发

```bash
# 安装依赖
npm install

# 生成 i18n（从 locales/*.yml）
npm run generate:i18n

# 开发
npm run dev

# 构建（会先执行 generate:i18n）
npm run build

# 生产运行
npm start
```

## 项目结构

- `app/` - Next.js 路由（首页、关于、工具动态路由）
- `components/` - 布局与工具页面组件
- `components/ui/` - 共享 UI（CopyButton、InputCopyable、TextareaCopyable 等，支持 i18n）
- `lib/` - 工具配置、i18n、主题、收藏等
- `locales/` - 多语言 YAML（en/zh/de/fr/uk 等）

## 原项目

- IT-Tools: https://it-tools.ywsj.eu.org/

## 许可

与原项目保持一致（如 GPL-3.0）。
