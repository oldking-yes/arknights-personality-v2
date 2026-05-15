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

- **纯前端 SPA** — React 19 + Vite 8 + TypeScript 6，部署至 GitHub Pages，无需后端
- **PWA 离线支持** — Service Worker 缓存 + manifest，可安装到主屏幕，断网可用
- **中英双语 i18n** — i18next 国际化，浏览器语言自动检测 + 手动切换
- **多平台分享卡片** — Canvas 生成微信(3:4)、B站(16:9)、小红书(1:1)三格式分享海报，JPEG 优化
- **CP 兼容度卡片** — 双人五维雷达图叠加，生成兼容度海报
- **罗德岛身份档案** — 仿游戏内干员档案 UI 的 Canvas 壁纸（750×1334）
- **深度链接 + 挑战链接** — URL 参数编码分数，分享直达结果；挑战模式自动对比
- **Top-3 匹配排行** — 展示最匹配的三位干员，点击可查看详细档案
- **方舟玩家向内容** — 干员描述取材于游戏剧情、档案与名场面，拒绝 MBTI 式抽象标签
- **雷达图可视化** — Chart.js 五维雷达图，直观对比你与干员的人格坐标
- **Endfield 工业风 UI** — PRTS 全息投影、旋转六边形、星座线框手部动画、CRT 扫描线
- **进度自动保存** — localStorage 持久化，意外关闭可续答
- **选项随机洗牌** — Fisher-Yates 算法，每次进入新题打乱选项顺序
- **React Error Boundary** — 异常边界优雅降级 + lazy code splitting
- **键盘快捷键** — `1-4` 选择答案，`Backspace` 返回上一题

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
├── App.tsx                     # 根组件：路由状态、进度管理、PRTS 终端、Debug 档案室
├── index.css                   # Tailwind 主题令牌 + 40+ 自定义动画 & 组件样式
├── data/
│   ├── types.ts                # TypeScript 类型定义（Operator / Question / Dimension）
│   ├── operators.ts            # 16 位干员数据（五维坐标 / Persona / 灵魂叙事 / 标签）
│   └── questions.ts            # 15 道战术情境测验题
├── utils/
│   ├── matching.ts             # 欧几里得距离匹配算法
│   └── storage.ts              # localStorage 进度持久化
└── components/
    ├── Intro.tsx               # 首页：PRTS 全息六边形 + 星座手部动画 + 普瑞塞斯低语彩蛋
    ├── Quiz.tsx                # 答题页：选项洗牌、进度条、键盘快捷键
    ├── Results.tsx             # 结果页：英雄立绘 / Persona 文案 / 雷达图 / Canvas 分享卡片
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
<summary>🖼 PRTS 全息界面（首页）</summary>

- **旋转六边形** — 三层同心六边形环以不同速度/方向旋转（40s CW / 25s CCW / 15s CW），顶点带光点标记
- **星座手部动画** — 21 个关节点 + 22 条连接线的线框手部网格（类似 3D 骨骼追踪），带掌心脉冲环 + 水平扫描线动画
- **HUD 角标** — 四角 L 形科技感装饰 + 数据读取点
- **漂浮粒子** — 4 个飘浮六边形微粒，营造全息投影氛围
- **普瑞塞斯低语** — 点击手部触发随机秘语信息，Toast 跟随手部按钮动态定位
- **PRTS 终端** — 点击六边形打开覆盖层终端，显示系统启动日志 + 闪烁光标（支持 X 关闭）
</details>

<details>
<summary>🖼 沉浸式结果页</summary>

- 全屏英雄立绘背景，CSS 渐变遮罩 + 图片加载失败自动回退到头像
- Persona 三段式人格速写 + 灵魂起源故事卡（含干员一句话简介 desc）
- 适配度百分比（灵魂共振 ≥ 80% / 深度匹配 ≥ 60% / 意外匹配） + 五维雷达图
- 维度对比条（用户 vs 干员）
- Canvas 生成分享卡片（JPEG 0.85，六边形背景合并为单路径绘制，性能优化 260×）
</details>

<details>
<summary>🔗 深度链接分享</summary>

URL 参数 `?s=5,9,6,5,7` 编码五维分数（或 `?c=op_name` 直接指定干员），分享后好友打开直接看到对应结果页，无需重新答题。

**SPA 兼容**：`404.html` 将 GitHub Pages 的 404 请求回退到 `index.html`，确保深度链接在任何路径下正常工作。
</details>

<details>
<summary>🕹 方舟玩家彩蛋</summary>

- 底部系统状态栏（Mon3tr Standby / Babel Archive / Endfield Signal…）
- 浏览器开发者控制台 PRTS / 普瑞塞斯主题信息（仅在首页触发）
- 全部干员档案室（底部的 DEBUG 入口）
- 干员详情页随机作战记录编号
- 语音风格的灵魂低语（点击首页全息手部图案）
</details>

<details>
<summary>♿ 可访问性与反作弊</summary>

- **键盘快捷键** — 答题时 `1`–`4` 选择答案，`Backspace` 返回上一题
- **图片 alt 文本** — 所有干员图片使用 `alt={op.name}`，提升屏幕阅读器兼容性
- **选项洗牌** — Fisher-Yates 算法每次进入新题随机打乱选项顺序，防止"选 A 最像/最强"的模式化猜测
- **尊重动效偏好** — `prefers-reduced-motion` 媒体查询自动禁用动画
</details>

<details>
<summary>⚡ 性能优化</summary>

- **Canvas 绘制** — 分享卡片背景 26×20 = 520 个六边形合并为单条路径，减少 260 倍 draw call
- **图片压缩** — 分享卡片输出格式从 PNG 改为 JPEG quality 0.85，文件体积减少 60–80%，深色背景无视觉差异
- **本地资源优先** — 干员头像与立绘使用本地打包资源，减少外部 CDN 请求
</details>

---

## 🧠 设计系统

完整的颜色令牌、排版比例、组件规格、动画参数、间距系统记录在 [`DESIGN.md`](./DESIGN.md) 中。

---

## 🔗 相关项目

- [yuanyan3060/Arknights-Bot-Resource](https://github.com/yuanyan3060/Arknights-Bot-Resource) — 干员图片资源

---

## 📄 许可证

MIT
