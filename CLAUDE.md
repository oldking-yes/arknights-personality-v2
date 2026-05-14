# Arknights Personality Quiz V2

## 设计系统
<design_system>
- 背景: #0D0F11 / #1A1C1E / #2D3238
- 高光: #F5E65C (柠檬黄)
- 辅助: #4A8FE4 (科技蓝) / #E8724A (橙红)
- 卡片: rgba(45,50,56,0.8) + 1px solid rgba(245,230,92,0.15)
- 字体: 标题粗体无衬线 / 正文圆角柔和
- 动画: cubic-bezier(0.4, 0, 0.2, 1)
- 底纹: 坐标网格线 SVG 背景 (opacity 0.05)
</design_system>

## 参考目标
- sayuriu/endfield — 终末地官网复刻 (配色/布局)
- mashirozx/arknights-ui — 方舟 CSS 复刻 (边框/扫描线)
- ef-frontend-v1 — 终末地一图流 (立绘目录结构)

## 工作流
1. 设计分析 → 提取 Token → 生成 DESIGN.md
2. 阅读 DESIGN.md → 按规格实现
3. Playwright 截图验证 → 对比参考 → 迭代
