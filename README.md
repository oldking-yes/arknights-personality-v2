# 罗德岛干员人格测试 · R.I. Personality Quiz

> **战场上的选择，照见你灵魂的形状。**  
> 十五道战术情境题，找到与你灵魂共振的那位罗德岛干员。

[![Deploy to GitHub Pages](https://github.com/oldking-yes/arknights-personality-v2/actions/workflows/deploy.yml/badge.svg)](https://github.com/oldking-yes/arknights-personality-v2/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

---

## ✨ 在线体验

**[https://oldking-yes.github.io/arknights-personality-v2/](https://oldking-yes.github.io/arknights-personality-v2/)**

---

## 📖 项目简介

《明日方舟》主题人格测试。通过 15 道战术情境选择题，从 **战术思维 · 情感方式 · 行动风格 · 秩序倾向 · 社交取向** 五个维度刻画你的人格图谱，在 16 位罗德岛干员中找到与你灵魂频率最接近的那一位。

项目特点：

- **纯前端 SPA** — React 19 + Vite 8，构建产物部署至 GitHub Pages，无需后端服务
- **方舟玩家向内容** — 干员描述取材于游戏剧情、档案与名场面，拒绝 MBTI 式抽象标签
- **雷达图可视化** — Chart.js 五维雷达图，直观对比你与干员的人格坐标
- **Canvas 分享卡片** — 浏览器端生成分享海报，一键保存
- **深度链接分享** — 通过 URL 参数编码分数，分享即直达结果
- **Endfield 工业风 UI** — CRT 扫描线、蜂窝网格动效、暗色主题、PRTS 系统彩蛋
- **进度自动保存** — localStorage 持久化，意外关闭可续答

---

## 🧩 技术栈

| 层 | 技术 | 用途 |
|---|------|------|
| **框架** | React 19 | 组件化 UI |
| **语言** | TypeScript 6 | 类型安全 |
| **构建** | Vite 8 | HMR 开发 + 生产构建 |
| **样式** | Tailwind CSS v4 | 原子化 CSS + `@theme` 设计令牌 |
| **动画** | Framer Motion 12 | 页面过渡与入场动效 |
| **图表** | Chart.js 4 + react-chartjs-2 | 五维雷达图 |
| **测试** | Playwright | 视觉回归截图 |
| **CI/CD** | GitHub Actions | 自动构建部署 Pages |
| **CDN** | yuanyan3060/Arknights-Bot-Resource | 干员头像与立绘 |

---

## 🏗 项目架构

```
src/
├── main.tsx                    # 入口
├── App.tsx                     # 根组件：路由状态、进度管理、Debug 档案室
├── index.css                   # Tailwind 主题 + 自定义组件样式
├── data/
│   ├── types.ts                # TypeScript 类型定义
│   ├── operators.ts            # 16 位干员数据（坐标/文案/标签）
│   └── questions.ts            # 15 道测验题
├── utils/
│   ├── matching.ts             # 欧几里得距离匹配算法
│   └── storage.ts              # localStorage 进度持久化
└── components/
    ├── Intro.tsx               # 首页 / 品牌展示
    ├── Quiz.tsx                # 答题页
    ├── Results.tsx             # 结果页（英雄图/文案/雷达图/分享卡片）
    └── RadarChart.tsx          # Chart.js 雷达图封装
```

### 匹配算法

用户每题选择映射到五个维度之一（0–3 分），15 题后各维度总分归一化为 0–10 坐标。使用**欧几里得距离**计算用户坐标与 16 位干员坐标的相似度，返回最匹配的干员及兼容度百分比。

```
用户坐标 = scores.map(s => Math.round(s / 9 * 10))
兼容度   = (1 - distance / maxDistance) × 100%
```

---

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 :5173）
npm run dev

# 类型检查 + 构建
npm run build

# 预览构建产物
npm run preview
```

---

## 🎨 产品亮点

<details>
<summary>🖼 沉浸式结果页</summary>

- 全屏英雄立绘背景，CSS 渐变遮罩
- Persona 三段式人格速写 + 灵魂起源故事卡
- 适配度百分比 + 五维雷达图
- 维度对比条（用户 vs 干员）
- Canvas 生成分享卡片（保存/复制链接）
</details>

<details>
<summary>🔗 深度链接分享</summary>

URL 参数 `?s=5,9,6,5,7` 编码五维分数，分享后好友打开直接看到对应结果页，无需重新答题。
</details>

<details>
<summary>🕹 方舟玩家彩蛋</summary>

- 底部系统状态栏（Mon3tr Standby / Babel Archive / Endfield Signal…）
- 开发者控制台 PRTS / 普瑞塞斯主题信息
- 全部干员档案室（DEBUG 入口）
- 干员详情页随机作战记录编号
</details>

<details>
<summary>♿ 键盘快捷键</summary>

答题时 `1`–`4` 选择答案，`Backspace` 返回上一题。
</details>

---

## 🔗 相关项目

- [yuanyan3060/Arknights-Bot-Resource](https://github.com/yuanyan3060/Arknights-Bot-Resource) — 干员图片资源

---

## 📄 许可证

MIT
