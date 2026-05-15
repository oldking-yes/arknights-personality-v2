# Arknights Personality Quiz V2 — CLAUDE.md

## 项目概述
《明日方舟》主题人格测验 SPA（React 19 + Vite 8 + Tailwind CSS v4）。  
15 道题 → 5 维人格坐标 → 匹配 16 位干员 → 雷达图 + 分享卡片。

## 关键路径
- 入口: `src/main.tsx` → `src/App.tsx`（状态路由）
- 页面: `Intro` → `Quiz` → `Results`
- 数据: `operators.ts`（16 干员坐标/文案） / `questions.ts`（15 题）
- 算法: `matching.ts`（欧几里得距离）
- 持久化: `storage.ts`（localStorage）

## 重要约定
- **图片路径**: 皮肤立绘 `images/skin/{char_id}_1.png`，回退到头像 `images/avatar/{char_id}.png`
- **BASE_URL**: 始终使用 `import.meta.env.BASE_URL` 拼接路径（GitHub Pages 子路径）
- **干员数据**: `operators.ts` 中 `coord` 为 5 维 0–10 数组，顺序对应 `dimLabels`
- **URL 分享**: `?s=a,b,c,d,e` 编码五维分数，`?c=op_id` 直接指定干员
- **样式**: Tailwind v4 `@theme` 令牌 + `index.css` 中的自定义类（如 `.soul-card` / `.persona-text`）
- **构建**: `npm run build` = `tsc -b && vite build`

## 设计系统
参考 `DESIGN.md` 获取完整颜色、排版、组件规格。

配色基调:
- 背景: `#0D0F11` / `#1A1C1E`
- 主色: `#F5E65C`（柠檬黄）
- 辅助: `#4A8FE4`（PRTS 科技蓝）/ `#E8724A`（橙红）
- 字体: 英文 `Cormorant Garamond` / 中文 `Noto Sans SC`

## 常见操作
- `npm run dev` — 开发服务器
- `npm run build` — 类型检查 + 构建
- `npx playwright test` — 视觉回归测试
- `npm run preview` — 预览构建产物
