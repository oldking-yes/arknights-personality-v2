# Arknights Personality Quiz V2 — Design Specification

> Extracted from source code at HEAD. All values in px unless noted. Accent system: **Lemon/Gold** (#F5E65C).

---

## 1. Color System

### Theme (Tailwind v4 `@theme` block)

| Token | Hex | OKLCH |
|-------|-----|-------|
| `--color-deep-900` | `#07090e` | oklch(0.03 0.01 260) |
| `--color-deep-800` | `#0a0e17` | oklch(0.04 0.015 260) |
| `--color-deep-700` | `#0f1520` | oklch(0.06 0.02 260) |
| `--color-slate-800` | `#141c2b` | oklch(0.10 0.025 265) |
| `--color-slate-700` | `#1e2d40` | oklch(0.15 0.03 265) |
| `--color-slate-600` | `#3a4555` | oklch(0.30 0.025 265) |
| `--color-slate-500` | `#607080` | oklch(0.48 0.03 260) |
| `--color-slate-400` | `#8a9bb5` | oklch(0.65 0.035 260) |
| `--color-slate-300` | `#c8d0dc` | oklch(0.82 0.02 260) |
| `--color-lemon` | `#F5E65C` | oklch(0.90 0.15 100) |
| `--color-lemon-dark` | `#D4C840` | oklch(0.80 0.14 100) |
| `--color-lemon-muted` | `#A89A20` | oklch(0.66 0.12 100) |
| `--color-orange-400` | `#ff8c42` | oklch(0.70 0.18 45) |
| `--color-red-400` | `#ff4060` | oklch(0.58 0.22 20) |
| `--color-card-bg` | `rgba(15,21,32,0.7)` | — (defined but unused in components) |

### Default Tailwind Colors Used

| Token | Hex | Usage |
|-------|-----|-------|
| `text-slate-200` | `#e2e8f0` | Question body text |
| `text-white` | `#ffffff` | Heading text |

### Accent: Lemon/Gold

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| `lemon` | `#F5E65C` | oklch(0.90 0.15 100) | Primary accent, active state, hover text |
| `lemon-dark` | `#D4C840` | oklch(0.80 0.14 100) | Disabled/subdued accent |
| `lemon-muted` | `#A89A20` | oklch(0.66 0.12 100) | Progress bar gradient start, muted accent |

### Alpha / Glass Tokens

| Usage | Value |
|-------|-------|
| Card background (quiz) | `rgba(20,28,43,0.8)` = `bg-slate-800/80` |
| Card background (results) | `rgba(20,28,43,0.6)` = `bg-slate-800/60` |
| Card border | `rgba(30,45,64,0.3)` = `border-slate-700/30` |
| Card border (quiz) | `rgba(30,45,64,0.5)` = `border-slate-700/50` |
| Grid line | `rgba(245,230,92,0.025)` |
| Scanline | `rgba(0,0,0,0.03)` |
| Selection bg | `rgba(0,212,255,0.2)` (cyan, not lemon) |
| Button primary bg | `rgba(245,230,92,0.15)` = `bg-lemon/15` |
| Button primary hover | `rgba(245,230,92,0.25)` = `bg-lemon/25` |
| Button secondary bg | `rgba(255,255,255,0.05)` = `bg-white/5` |
| Button secondary hover | `rgba(255,255,255,0.08-0.10)` = `bg-white/[0.08]` |

### Operator-Specific Colors (from `operators.ts`)

| Operator | Hex | OKLCH |
|----------|-----|-------|
| 阿米娅 | `#00b8ff` | oklch(0.73 0.18 240) |
| 陈 | `#ff4444` | oklch(0.58 0.24 25) |
| 银灰 | `#c0c0c0` | oklch(0.78 0 0) |
| 德克萨斯 | `#ff8c00` | oklch(0.70 0.18 65) |
| 拉普兰德 | `#ff60a0` | oklch(0.63 0.22 350) |
| 能天使 | `#ff2222` | oklch(0.56 0.22 25) |
| 斯卡蒂 | `#3a5fe5` | oklch(0.45 0.18 270) |
| 塞雷娅 | `#ff8c42` | oklch(0.70 0.18 45) |
| 煌 | `#ff5500` | oklch(0.64 0.22 40) |
| 凯尔希 | `#44cc88` | oklch(0.72 0.18 160) |
| 莫斯提马 | `#6688ff` | oklch(0.58 0.18 270) |
| 史尔特尔 | `#cc3388` | oklch(0.52 0.20 340) |
| 安洁莉娜 | `#ff88cc` | oklch(0.70 0.18 350) |
| 星熊 | `#44dd44` | oklch(0.76 0.18 140) |
| 伊芙利特 | `#ff4400` | oklch(0.62 0.22 35) |
| W | `#dd2222` | oklch(0.54 0.20 25) |

---

## 2. Typography

### Font Stack

```
'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif   /* body default (global) */
'Share Tech Mono', monospace                               /* radar legend + tooltip */
```

### Type Scale

| Level | Size | Line Height | Weight | Tracking | Color |
|-------|------|-------------|--------|----------|-------|
| h1 (intro title) | `30px` / `36px` (sm+) | tight (via `font-bold tracking-tight`) | 700 | -0.025em (tracking-tight) | `#ffffff` |
| h2 (result name) | `20px` | — | 700 | 0.05em (tracking-wider) | per-operator |
| Question body | `16px` / `18px` (sm+) | 1.625 (leading-relaxed) | 500 (font-medium) | — | `#e2e8f0` (text-slate-200) |
| Intro description | `14px` | leading-relaxed | 400 | — | `#607080` (text-slate-500) |
| Dimension label | `12px` | — | 400 | — | `#8a9bb5` (text-slate-400) |
| Mono meta (xs) | `12px` | — | 400 | 0.05–0.2em | `#607080` (text-slate-500) |
| Mini badge | `~9px` (`0.55rem`) | — | 400 | 0.2em (tracking-widest) | `#3a4555` (text-slate-600) |
| Mini badge (slightly larger) | `~10px` (`0.6rem`) | — | 400 | 0.2em (tracking-widest) | `#607080` (text-slate-500) |
| English subtitle (intro) | `12px` (`0.75rem` = text-xs) | — | 400 | 0.25em | `#F5E65C` (text-lemon) |

### Tailwind Utility Mapping

| Class | Resolves To |
|-------|-------------|
| `.text-xs` | `0.75rem` = 12px |
| `.text-sm` | `0.875rem` = 14px |
| `.text-base` | `1rem` = 16px |
| `.text-lg` | `1.125rem` = 18px |
| `.text-xl` | `1.25rem` = 20px |
| `.text-3xl` | `1.875rem` = 30px |
| `.text-4xl` | `2.25rem` = 36px |
| `.font-mono` | `'Share Tech Mono', monospace` |
| `.tracking-tight` | `-0.025em` |
| `.tracking-wider` | `0.05em` |
| `.tracking-widest` | `0.1em` / `0.2em` / `0.25em` |
| `.tabular-nums` | `font-variant-numeric: tabular-nums` |
| `.leading-relaxed` | `1.625` |

---

## 3. Component Specs

### 3.1 Logo Hex (Intro)

```
┌────────────────────────┐
│        ⬡               │
│       ◉ R.I.           │  120×140 SVG viewBox
│        ⬡               │
└────────────────────────┘

Container:       w-20 h-24 (80×96px)
Outer hexagon:   stroke="#F5E65C" strokeWidth=1.5 opacity=0.6
Inner hexagon:   stroke="#F5E65C" strokeWidth=0.8 opacity=0.3
Text:            "R.I." fill="#F5E65C" font-size=28 bold
```

### 3.2 Divider Line (Intro)

```
Width:           56px (w-14)
Height:          2px (h-0.5)
Style:           bg-gradient-to-r from-transparent via-lemon to-transparent
Margin:          my-4 (16px top/bottom)
```

### 3.3 Button — Primary (Start Test)

```
Dimensions:      px-10 py-3.5  (40px L/R, 14px T/B)
Typography:      font-mono text-sm (14px) tracking-widest uppercase
Colors:          bg-lemon/15  border-lemon/60  text-lemon
States:
  hover:         bg-lemon/25  border-lemon  shadow-[0_0_20px_rgba(245,230,92,0.15)]
  active:        scale-95
Transition:      all 300ms  cubic-bezier(0.4, 0, 0.2, 1)
```

### 3.4 Button — Secondary (Quick Result / Nav Back / Share)

```
Dimensions:      px-6 py-2.5  (24px L/R, 10px T/B)
Typography:      font-mono text-xs (12px) tracking-wider uppercase
Colors:          bg-white/5  border-slate-700  text-slate-500
States:
  hover:         bg-white/[0.08]  border-slate-500  text-white
  active:        scale-95
Transition:      all 200ms  cubic-bezier(0.4, 0, 0.2, 1)
```

Two icon variants: ⚡ (intro) / ⊕ (share) / ‹ (back)

### 3.5 Button — CTA (Restart)

```
Dimensions:      px-5 py-2.5  (20px L/R, 10px T/B)
Typography:      font-mono text-xs (12px) tracking-wider uppercase
Colors:          bg-lemon/15  border-lemon/50  text-lemon
States:
  hover:         bg-lemon/25  border-lemon
  active:        scale-95
Transition:      all 200ms  cubic-bezier(0.4, 0, 0.2, 1)
```

Icon: ↻ (U+21BB)

### 3.6 Option Card (Quiz Choices)

```
┌──┬──────────────────────────┐
│A │  派侦察兵摸清敌情...        │
└──┴──────────────────────────┘

Dimensions:      p-3.5 (14px) → p-4 (16px sm+)  gap-3  w-full
Typography:      text-sm (14px)  leading-relaxed  text-slate-300
Label:           font-mono text-xs (12px) font-bold text-lemon  min-w-[1.2rem] pt-0.5
Colors:          bg-slate-700/30  border-slate-700/40
States:
  hover:         border-lemon/50  bg-lemon/5
  active:        border-lemon
  whileHover:    scale-1.01
  whileTap:      scale-0.98
Transition:      all 200ms
Entry stagger:   60ms × index  (opacity 0→1  y: 16→0)
```

### 3.7 Card (Generic Container)

```
Colors:          bg-slate-800/60  border-slate-700/30
                 backdrop-filter: blur(4px)   /* quiz card only: backdrop-blur-sm */
Padding:         p-5 (20px) → p-6 (24px sm+)
Border:          1px solid
Radius:          0 (sharp corners)
```

Quiz card uses `bg-slate-800/80` instead of `/60`, and includes `backdrop-blur-sm`.

### 3.8 Progress Bar (Quiz Header)

```
┌────────────────────────────────┐
│████████████░░░░░░░░░░░░░  8/15 │
└────────────────────────────────┘

Track:           h-1.5 (6px)  bg-slate-700/50  rounded-full
                 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]
Fill:            gradient(90deg, #A89A20 → #F5E65C)  rounded-full
Counter:         font-mono text-xs (12px)  text-lemon  tabular-nums tracking-wider
                 min-w-[3.5rem]  text-right
Animation:       width animate 400ms ease-out
```

### 3.9 Dimension Bar (Results Comparison)

```
┌────────────────────────────────┐
│ 战术思维      你 7 · 陈 10      │
│ ████████░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────────┘

Track:           h-2 (8px)  bg-slate-700/40  rounded-full  overflow-hidden  relative
User fill:       width: (value × 10)%  bg: op-color  opacity-70  absolute inset-y-0 left-0
                 rounded-full
Op fill:         width: (value × 10)%  bg: repeating-linear-gradient(90deg,
                   op-color+00, op-color+80 2px, transparent 2px, transparent 4px)
                 opacity-50  absolute top-0 bottom-0  rounded-full
Animation:       width transition 700ms ease-out  (150ms delay for op bar)
Label:           text-xs (12px) text-slate-400
Value:           font-mono text-[0.6rem] text-slate-500
```

### 3.10 Radar Chart (Personality Matrix)

```
Container:       w-full  h-[280px]  bg-slate-800/60 border-slate-700/30 p-3 sm:p-4
Chart:           Chart.js Radar type
                  responsive  maintainAspectRatio=true
Grid:            PolarGrid  color=rgba(30,45,64,0.6)  lineWidth=1
Angle lines:     color=rgba(30,45,64,0.4)  lineWidth=1
Point labels:    color=#607080  font:'Noto Sans SC', sans-serif  11px  padding=16
Ticks:           stepSize=2  hidden  min=0 max=10
User dataset:    stroke=op-color fill=op-color+33  borderWidth=2.5
                 pointRadius=3  pointBg=op-color  pointBorder=#07090e  pointBorderWidth=1.5
Op dataset:      stroke=op-color  fill=op-color+14  borderWidth=1.5  borderDash=[4,4]
                 pointRadius=0
Tooltip:         bg=rgba(15,21,32,0.9)  titleColor=#c8d0dc  bodyColor=#8a9bb5
                 border=rgba(30,45,64,0.5)  1px  padding=8  cornerRadius=0
                 titleFont:'Space Grotesk', sans-serif 12px  bodyFont:11px
Legend:          position=bottom  color=#607080  font:'Share Tech Mono', monospace 11px
                 boxWidth=12  boxHeight=4  padding=12
Animation:       duration=800  easing=easeOutQuart
```

### 3.11 Tag / Badge

```
┌──────────────────────────┐
│ ★★★★★ 近卫 · 龙门近卫局    │
├──────────────────────────┤
│    VERSION 2.0           │
└──────────────────────────┘

Operator tag:
  font-mono text-[0.6rem] tracking-wider  inline-block
  color: op-color  border: 1px solid op-color+40  px-2 py-0.5

Version tag:
  font-mono text-[0.55rem] tracking-widest  px-2 py-1
  color: text-slate-600  border: 1px solid border-slate-700  bg: bg-white/[0.02]
```

### 3.12 Operator Avatar Frame

```
Container:       w-[72px] h-[72px] relative  mx-auto mb-3
Hex SVG:         80×80 viewBox
  outer hex:     fill: op-color+08  stroke: op-color  0.8px  opacity=0.5
  inner hex:     fill: none  stroke: op-color  0.3px  opacity=0.3
Image:           60×60  rounded-full  object-cover  absolute top-[6px] left-[6px]
                 z-10
                 onError → display:none (hide if broken)
Glow bg:         radial-gradient(ellipse at 50% 0%, op-color, transparent 60%)
                 opacity-10  absolute inset-0  pointer-events-none
```

### 3.13 Match Percentage Display

```
适配度 85%

Typography:      font-mono text-sm (14px) tracking-wider
Percentage:      text-xl (20px) font-bold  color: op-color
```

---

## 4. Animation Parameters

### 4.1 Timing & Easing

| Element | Property | Duration | Easing / Type |
|---------|----------|----------|---------------|
| Intro → Quiz page transition | opacity, scale | 300ms | easeOut (framer-motion default) |
| Question slide-in | opacity, x: 40→0 | 300ms | easeOut |
| Question slide-out | opacity: 1→0, x: 0→-40 | 300ms | easeOut |
| Progress bar | width | 400ms | easeOut |
| Option entry stagger | opacity, y: 16→0 | 200ms | easeOut (delay: 60ms × i) |
| Dimension bar | width | 700ms | easeOut (+150ms delay for op bar) |
| Button hover | all | 200ms / 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Result card spring | scale, opacity | — | spring: stiffness=200, damping=20 |
| Particle pulse | opacity | 2000–5000ms | ease-in-out infinite |
| Radar chart draw | points | 800ms | easeOutQuart |
| Result section stagger | y: 20→0, opacity: 0→1 | 300ms | easeOut |

### 4.2 Stagger Delays

| Context | Step | Delay |
|---------|------|-------|
| Intro content | container fade | 0ms |
| | h1 group (y:30→0) | 150ms (duration: 700ms) |
| | button group (y:20→0) | 500ms |
| | badges | 800ms |
| Question options | per item | 60ms × index |
| Result sections | bars | 200ms |
| | radar | 350ms |
| | description | 500ms |
| | actions | 650ms |

### 4.3 Intro Animation Sequence

```
t=0ms      container: opacity 0 → 1
t=150ms    heading group: y+=30, opacity 0 → 1  (duration 700ms)
t=500ms    button group: y+=20, opacity 0 → 1
t=800ms    badges: opacity 0 → 1
```

### 4.4 Quiz Transition

```
On answer (next question):
  exit:  opacity 1→0, x: 0→-40   (300ms easeOut)
  enter: opacity 0→1, x: +40→0   (300ms easeOut)
```

### 4.5 Results Stagger

```
t=0ms        operator card: scale 0.92→1, opacity 0→1 (spring)
t=200ms      dimension bars: y+=20, opacity 0→1
t=350ms      radar chart: y+=20, opacity 0→1
t=500ms      description: y+=20, opacity 0→1
t=650ms      action buttons: y+=20, opacity 0→1
```

---

## 5. Layout & Spacing

### Content Width

| Container | Max Width | Padding X |
|-----------|-----------|-----------|
| App wrapper | 512px (`max-w-lg`) | 12px (`px-3`) |
| Intro inner | 448px (`max-w-md`) | 20px (`px-5`) |
| Quiz/Results | 448px (`max-w-md`) | 16px (`px-4`) |

### Vertical Rhythm

- `gap-2.5` (10px) between answer options
- `gap-3` (12px) between card sections
- `mb-3` (12px) between cards
- `mb-6` (24px) between progress bar and question card
- `mt-4` (16px) between description and actions
- `mt-8` (32px) between button group and badges (intro)
- `gap-2` (8px) between badges
- `mb-1` (4px) between dimension label and bar
- `mt-0.5` (2px) between result name and title

### Full-Height Layout

```
min-h-screen  +  flex flex-col items-center justify-center  py-8
```

---

## 6. Background Effects

### Lemon Coordinate Grid

```css
background-image:
  linear-gradient(rgba(245,230,92,.025) 1px, transparent 1px),
  linear-gradient(90deg, rgba(245,230,92,.025) 1px, transparent 1px);
background-size: 40px 40px;
```

### CRT Scanline Overlay

```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0,0,0,.03) 2px,
  rgba(0,0,0,.03) 4px
);
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Particle System

```
Count:        20 dots
Size:         2×2 px  rounded-full
Color:        rgba(245,230,92,0.20)  (= bg-lemon/20)
Position:     random (0–100%)  absolute
Animation:    fadeInOut — opacity 0→1→0
Keyframes:    @keyframes pulse { 0%,100%{opacity:0} 50%{opacity:1} }
Duration:     2–5s random  ease-in-out infinite
Delay:        0–3s random
```

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Changes |
|------------|-------|---------|
| `sm` | ≥640px | h1: 30px → 36px; card pad: 20px → 24px; option pad: 14px → 16px; question: 16px → 18px |
| Content cap | ≤512px | max content width (`max-w-lg` on wrapper, `max-w-md` on inner) |

No mobile-specific breakpoints below 640px — base styles serve as mobile defaults.

---

## 9. Interaction States

| State | Visual |
|-------|--------|
| Selection background | `rgba(0, 212, 255, 0.2)` (cyan selection) |
| Reduced motion | All animations/transitions → `0.01ms` |
| Keyboard | `1-4` select options, `Backspace` go back |
| Share fallback | `navigator.share` → `navigator.clipboard.writeText` |
| Image error | Avatar hidden (`display: none`) |
| Resume quiz | `window.confirm` on mount if saved progress detected |

---

## 10. Shadows & Glows

| Usage | Value |
|-------|-------|
| Button primary hover | `0 0 20px rgba(245,230,92,0.15)` |
| Operator card glow | `radial-gradient(ellipse at 50% 0%, op-color, transparent 60%)` opacity 0.1 |
| Progress bar inner shadow | `inset 0 1px 2px rgba(0,0,0,0.3)` |

---

## 11. Border Radius

| Element | Radius |
|---------|--------|
| Cards | `0` (sharp, no radius) |
| Progress bar track/fill | `9999px` (fully rounded) |
| Dimension bar track/fill | `9999px` (fully rounded) |
| Avatar image | `9999px` (fully rounded) |
| Particle dots | `9999px` |
| Operator tag | `0` (sharp) |
| Tooltip (radar) | `0` (cornerRadius: 0) |

---

## 12. Key Data Constants

| Constant | Value |
|----------|-------|
| Total questions | 15 |
| Dimension count | 5 |
| Score range per dim | 0–30 (3 per question × 15Q, max 3 per opt) |
| Coordinate range | 0–10 |
| Operators | 16 |
| Dimension labels | `['战术思维','情感方式','行动风格','秩序倾向','社交取向']` |
