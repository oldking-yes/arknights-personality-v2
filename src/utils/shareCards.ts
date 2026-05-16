import { DIM_LABELS } from '../data/types';
import type { Operator } from '../data/types';
import type { RankedMatch } from './matching';

const IMG = import.meta.env.BASE_URL + 'images/';

/** Load an image, returning null on error */
function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Load a QR code image for the given URL. Uses qrserver API with warm-white-on-dark palette. */
async function loadQR(url: string, size: number = 100): Promise<HTMLImageElement | null> {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=E8E3D8&bgcolor=0D0F11&margin=8`;
  return loadImg(qrUrl);
}

/** Draw pentagon radar chart */
export function drawRadar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  user: number[], opCoords: number[],
  opColor: string, labels: string[] = DIM_LABELS,
) {
  const angles = labels.map((_, i) => (i * 72 - 90) * Math.PI / 180);
  // Grid
  for (let ring = 1; ring <= 5; ring++) {
    const r = (radius / 5) * ring;
    ctx.beginPath();
    angles.forEach((a, i) => i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)));
    ctx.closePath();
    ctx.strokeStyle = `rgba(232,227,216,${0.04 + ring * 0.03})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  // Axes
  angles.forEach(a => {
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.strokeStyle = 'rgba(232,227,216,0.08)'; ctx.lineWidth = 0.5; ctx.stroke();
  });
  // Labels
  ctx.textAlign = 'center'; ctx.fillStyle = '#8A8270'; ctx.font = '13px "Noto Sans SC", sans-serif';
  angles.forEach((a, i) => { const x = cx + (radius + 28) * Math.cos(a); const y = cy + (radius + 28) * Math.sin(a); ctx.fillText(labels[i], x, y + 4); });
  // User polygon
  ctx.beginPath();
  angles.forEach((a, i) => { const r = (user[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.closePath(); ctx.fillStyle = 'rgba(232,227,216,0.15)'; ctx.fill(); ctx.strokeStyle = '#E8E3D8'; ctx.lineWidth = 1.5; ctx.stroke();
  // Op polygon
  ctx.beginPath();
  angles.forEach((a, i) => { const r = (opCoords[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.closePath(); ctx.setLineDash([4, 4]); ctx.strokeStyle = opColor; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
  // User points
  angles.forEach((a, i) => { const r = (user[i] / 10) * radius; ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3, 0, Math.PI * 2); ctx.fillStyle = '#E8E3D8'; ctx.fill(); });
}

/** Draw a dual-person radar chart for CP compatibility card */
export function drawDualRadar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  coords1: number[], color1: string, name1: string,
  coords2: number[], color2: string, name2: string,
) {
  const angles = DIM_LABELS.map((_, i) => (i * 72 - 90) * Math.PI / 180);
  for (let ring = 1; ring <= 5; ring++) {
    const r = (radius / 5) * ring;
    ctx.beginPath();
    angles.forEach((a, i) => i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)));
    ctx.closePath();
    ctx.strokeStyle = `rgba(232,227,216,${0.04 + ring * 0.03})`; ctx.lineWidth = 0.5; ctx.stroke();
  }
  angles.forEach(a => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a)); ctx.strokeStyle = 'rgba(232,227,216,0.08)'; ctx.lineWidth = 0.5; ctx.stroke(); });
  ctx.textAlign = 'center'; ctx.fillStyle = '#8A8270'; ctx.font = '13px "Noto Sans SC", sans-serif';
  angles.forEach((a, i) => { const x = cx + (radius + 28) * Math.cos(a); const y = cy + (radius + 28) * Math.sin(a); ctx.fillText(DIM_LABELS[i], x, y + 4); });
  // Person 1
  ctx.beginPath();
  angles.forEach((a, i) => { const r = (coords1[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.closePath(); ctx.fillStyle = color1 + '20'; ctx.fill(); ctx.strokeStyle = color1; ctx.lineWidth = 2; ctx.stroke();
  angles.forEach((a, i) => { const r = (coords1[i] / 10) * radius; ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 4, 0, Math.PI * 2); ctx.fillStyle = color1; ctx.fill(); });
  // Person 2
  ctx.beginPath();
  angles.forEach((a, i) => { const r = (coords2[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.closePath(); ctx.fillStyle = color2 + '20'; ctx.fill(); ctx.setLineDash([6, 4]); ctx.strokeStyle = color2; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  angles.forEach((a, i) => { const r = (coords2[i] / 10) * radius; ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 4, 0, Math.PI * 2); ctx.fillStyle = color2; ctx.fill(); });
  // Legend
  ctx.fillStyle = color1; ctx.fillRect(cx - 80, cy + radius + 44, 10, 10);
  ctx.fillStyle = '#E8E3D8'; ctx.textAlign = 'left'; ctx.font = '12px "Noto Sans SC", sans-serif'; ctx.fillText(name1, cx - 66, cy + radius + 53);
  ctx.fillStyle = color2; ctx.fillRect(cx + 20, cy + radius + 44, 10, 10);
  ctx.fillText(name2, cx + 34, cy + radius + 53);
}

/** Draw hex background pattern */
export function drawHexBg(ctx: CanvasRenderingContext2D, cols: number, rows: number) {
  ctx.beginPath();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * 48 + (r % 2) * 24, cy = r * 40;
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 - 30) * Math.PI / 180;
        const x = cx + 20 * Math.cos(a), y = cy + 20 * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
  }
  ctx.strokeStyle = 'rgba(232,227,216,0.03)'; ctx.lineWidth = 0.5; ctx.stroke();
}

/** Wrap CJK text into lines */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth) { lines.push(line); line = ch; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export type ShareFormat = 'wechat' | 'xiaohongshu' | 'bilibili';

interface ShareCardOptions {
  format: ShareFormat;
  op: Operator;
  compatible: number;
  userCoords: number[];
  ranking: RankedMatch[];
  shareUrl: string;
  i18n?: { subtitle: string; compatibility: string; footer: string };
}

/** Generate a share card with platform-specific layout */
export async function generateShareCard(options: ShareCardOptions): Promise<string> {
  const { format } = options;

  let W: number, H: number;
  switch (format) {
    case 'xiaohongshu': W = 1080; H = 1080; break;
    case 'bilibili':    W = 1280; H = 720;  break;
    default:            W = 800;  H = 1300; break;
  }

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  ctx.fillStyle = '#0D0F11'; ctx.fillRect(0, 0, W, H);

  if (format === 'bilibili') {
    await drawBilibiliCard(ctx, W, H, options);
  } else if (format === 'xiaohongshu') {
    await drawXiaohongshuCard(ctx, W, H, options);
  } else {
    await drawWechatCard(ctx, W, H, options);
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}

/** WeChat 3:4 card (800×1300) — refined version of current layout */
async function drawWechatCard(ctx: CanvasRenderingContext2D, W: number, H: number, opts: ShareCardOptions) {
  const { op, compatible, userCoords, ranking, shareUrl } = opts;
  drawHexBg(ctx, 20, 26);

  // Glow
  const grad = ctx.createRadialGradient(W / 2, 160, 20, W / 2, 160, 380);
  grad.addColorStop(0, op.color + '30'); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 450);

  // Avatar
  const avatarImg = await loadImg(IMG + 'avatar/' + op.avatar.replace('#', '%23') + '.jpg');
  if (avatarImg) { ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 80, 48, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); ctx.drawImage(avatarImg, W / 2 - 48, 32, 96, 96); ctx.restore(); }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A8270'; ctx.font = '18px "Cormorant Garamond", serif';
  ctx.fillText('与你灵魂共振的干员', W / 2, avatarImg ? 165 : 90);

  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 64px "Cormorant Garamond", serif';
  ctx.fillText(op.name, W / 2, avatarImg ? 250 : 180);

  ctx.fillStyle = '#B8B0A0'; ctx.font = '20px "Noto Sans SC", sans-serif';
  ctx.fillText(op.title, W / 2, avatarImg ? 290 : 220);

  drawRadar(ctx, W / 2, 460, 170, userCoords, op.coords, op.color);

  ctx.fillStyle = '#E8E3D8'; ctx.fillRect(W / 2 - 140, 600, 14, 14);
  ctx.font = '14px "Cormorant Garamond", serif'; ctx.fillText('你的坐标', W / 2 - 116, 612);
  ctx.strokeStyle = op.color; ctx.setLineDash([4, 4]); ctx.strokeRect(W / 2 + 40, 600, 14, 14); ctx.setLineDash([]);
  ctx.fillStyle = op.color; ctx.fillText(op.name, W / 2 + 64, 612);

  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 48px "Cormorant Garamond", serif';
  ctx.fillText(`${compatible}%`, W / 2, 678);
  ctx.fillStyle = '#8A8270'; ctx.font = '16px "Cormorant Garamond", serif';
  ctx.fillText('适配度', W / 2, 705);

  ctx.fillStyle = '#B8B0A0'; ctx.font = '16px "Noto Sans SC", sans-serif';
  let ty = 760;
  op.persona.slice(0, 2).forEach(t => {
    const lines = wrapText(ctx, t, 520);
    lines.forEach(l => { ctx.fillText(l, W / 2, ty); ty += 26; });
    ty += 10;
  });

  ty += 16;
  op.tags.slice(0, 4).forEach((tag, i) => {
    const x = 150 + i * 140; const tw = ctx.measureText(tag).width + 24;
    ctx.strokeStyle = 'rgba(232,227,216,0.2)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(x - tw / 2, ty - 10, tw, 28);
    ctx.fillStyle = '#8A8270'; ctx.font = '14px "Cormorant Garamond", serif'; ctx.fillText(tag, x, ty + 7);
  });

  ty += 60;
  ctx.fillStyle = '#6A6050'; ctx.font = '14px "Cormorant Garamond", serif';
  ctx.fillText('— 其他匹配 —', W / 2, ty);
  ty += 30;
  ranking.slice(1, 4).forEach((m, i) => {
    ctx.fillStyle = '#8A8270'; ctx.font = '17px "Cormorant Garamond", serif';
    ctx.fillText(`#${i + 2} ${m.op.name} · ${m.compatible}%`, W / 2, ty); ty += 28;
  });

  ctx.fillText('罗德岛干员人格测试 · R.I. Personality Quiz', W / 2, H - 90);
  await drawHexQR(ctx, shareUrl, W / 2, H - 60, 72);
}

/** 小🍠 1:1 card (1080×1080) — magazine-style, big portrait */
async function drawXiaohongshuCard(ctx: CanvasRenderingContext2D, W: number, H: number, opts: ShareCardOptions) {
  const { op, compatible, userCoords, shareUrl } = opts;

  // Subtle hex bg
  drawHexBg(ctx, 24, 28);

  // Large portrait as background
  const portraitSrc = op.portrait?.startsWith('skin/')
    ? IMG + op.portrait.replace('#', '%23')
    : IMG + 'skin/' + op.avatar.replace('#', '%23') + '_2b.jpg';
  const portraitImg = await loadImg(portraitSrc);
  if (portraitImg) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    const scale = Math.max(W / portraitImg.width, H / portraitImg.height);
    const dw = portraitImg.width * scale, dh = portraitImg.height * scale;
    ctx.drawImage(portraitImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.restore();
  }

  // Dark overlay for readability
  const overlayGrad = ctx.createLinearGradient(0, H * 0.3, 0, H);
  overlayGrad.addColorStop(0, 'transparent'); overlayGrad.addColorStop(1, '#0D0F11');
  ctx.fillStyle = overlayGrad; ctx.fillRect(0, 0, W, H);

  // Center content
  ctx.textAlign = 'center';

  // Avatar (large)
  const avatarImg = await loadImg(IMG + 'avatar/' + op.avatar.replace('#', '%23') + '.jpg');
  if (avatarImg) {
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 300, 120, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    ctx.drawImage(avatarImg, W / 2 - 120, 180, 240, 240); ctx.restore();
  }

  ctx.fillStyle = '#8A8270'; ctx.font = '22px "Cormorant Garamond", serif';
  ctx.fillText('罗德岛干员人格测试', W / 2, 440);

  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 80px "Cormorant Garamond", serif';
  ctx.fillText(op.name, W / 2, 530);

  ctx.fillStyle = op.color; ctx.font = '28px "Noto Sans SC", sans-serif';
  ctx.fillText(op.title, W / 2, 575);

  // Compatibility big number
  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 100px "Cormorant Garamond", serif';
  ctx.fillText(`${compatible}%`, W / 2, 680);
  ctx.fillStyle = '#8A8270'; ctx.font = '24px "Cormorant Garamond", serif';
  ctx.fillText('灵魂适配度', W / 2, 720);

  // Radar (smaller)
  drawRadar(ctx, W / 2, 880, 130, userCoords, op.coords, op.color);

  // Footer
  ctx.fillText('测测你的干员人格 · 扫码开始', W / 2 - 80, H - 50);
  await drawHexQR(ctx, shareUrl, W - 130, H - 150, 96);
}

/** B站 16:9 card (1280×720) — split layout */
async function drawBilibiliCard(ctx: CanvasRenderingContext2D, W: number, H: number, opts: ShareCardOptions) {
  const { op, compatible, userCoords, ranking, shareUrl } = opts;

  drawHexBg(ctx, 28, 18);

  // Left panel: operator info (40%)
  const leftW = W * 0.4;
  const centerX = leftW / 2;

  // Glow on left
  const grad = ctx.createRadialGradient(centerX, 200, 20, centerX, 200, 400);
  grad.addColorStop(0, op.color + '30'); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, leftW, H);

  // Avatar
  const avatarImg = await loadImg(IMG + 'avatar/' + op.avatar.replace('#', '%23') + '.jpg');
  if (avatarImg) { ctx.save(); ctx.beginPath(); ctx.arc(centerX, 160, 70, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); ctx.drawImage(avatarImg, centerX - 70, 90, 140, 140); ctx.restore(); }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A8270'; ctx.font = '14px "Cormorant Garamond", serif';
  ctx.fillText('罗德岛干员人格测试', centerX, 260);

  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 52px "Cormorant Garamond", serif';
  ctx.fillText(op.name, centerX, 320);

  ctx.fillStyle = op.color; ctx.font = '20px "Noto Sans SC", sans-serif';
  ctx.fillText(op.title, centerX, 352);

  ctx.fillStyle = '#B8B0A0'; ctx.font = '16px "Noto Sans SC", sans-serif';
  ctx.fillText(op.desc, centerX, 390);

  // Compatibility
  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 64px "Cormorant Garamond", serif';
  ctx.fillText(`${compatible}%`, centerX, 460);
  ctx.fillStyle = '#8A8270'; ctx.font = '18px "Cormorant Garamond", serif';
  ctx.fillText('适配度', centerX, 486);

  // Tags
  op.tags.slice(0, 3).forEach((tag, i) => {
    const x = centerX - 80 + i * 85; const tw = ctx.measureText(tag).width + 16;
    ctx.strokeStyle = 'rgba(232,227,216,0.15)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(x - tw / 2, 510, tw, 24);
    ctx.fillStyle = '#8A8270'; ctx.font = '12px "Cormorant Garamond", serif'; ctx.fillText(tag, x, 527);
  });

  // Divider
  ctx.strokeStyle = 'rgba(232,227,216,0.06)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(leftW, 40); ctx.lineTo(leftW, H - 40); ctx.stroke();

  // Right panel: radar + stats
  const rightCX = leftW + (W - leftW) / 2;
  drawRadar(ctx, rightCX, 280, 180, userCoords, op.coords, op.color);

  // Ranking
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6A6050'; ctx.font = '14px "Cormorant Garamond", serif';
  ctx.fillText('其他匹配', rightCX, 510);
  let ry = 540;
  ranking.slice(1, 4).forEach((m, i) => {
    ctx.fillStyle = '#8A8270'; ctx.font = '15px "Cormorant Garamond", serif';
    ctx.fillText(`#${i + 2} ${m.op.name} · ${m.compatible}%`, rightCX, ry); ry += 28;
  });

  // CTA + QR
  ctx.fillText('看看你的干员人格 →', rightCX, H - 60);
  await drawHexQR(ctx, shareUrl, W - 80, H - 120, 80);
}

/** Draw hex-framed QR code — warm-white hex ring around the QR */
async function drawHexQR(ctx: CanvasRenderingContext2D, url: string, cx: number, cy: number, size: number) {
  // Outer hex ring
  ctx.save();
  ctx.translate(cx, cy);
  const hexR = size / 2 + 16;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 - 30) * Math.PI / 180;
    const x = hexR * Math.cos(a), y = hexR * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(245,230,92,0.2)`;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Inner ring
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 - 30) * Math.PI / 180;
    const x = (hexR - 4) * Math.cos(a), y = (hexR - 4) * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(245,230,92,0.08)`;
  ctx.stroke();
  ctx.restore();

  // QR code
  const qrImg = await loadQR(url, size);
  if (qrImg) {
    // Round-clipped QR inset
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - size / 2, cy - size / 2, size, size, 8);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(qrImg, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
    // Subtle border
    ctx.strokeStyle = 'rgba(232,227,216,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - size / 2, cy - size / 2, size, size, 8);
    ctx.stroke();
  }
}

/** CP compatibility card — 3:4 vertical (900×1200) */
export async function generateCPCard(
  op1: Operator, coords1: number[], op2: Operator, coords2: number[], compat: number,
): Promise<string> {
  const W = 900, H = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  ctx.fillStyle = '#0D0F11'; ctx.fillRect(0, 0, W, H);
  drawHexBg(ctx, 20, 30);

  // Op1 muted portrait (left)
  const img1 = await loadImg(IMG + 'avatar/' + op1.avatar.replace('#', '%23') + '.jpg');
  if (img1) { ctx.save(); ctx.globalAlpha = 0.18; ctx.drawImage(img1, -150, 50, 600, 600); ctx.restore(); }

  // Op2 muted portrait (right)
  const img2 = await loadImg(IMG + 'avatar/' + op2.avatar.replace('#', '%23') + '.jpg');
  if (img2) { ctx.save(); ctx.globalAlpha = 0.18; ctx.drawImage(img2, W - 450, 50, 600, 600); ctx.restore(); }

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A8270'; ctx.font = '22px "Cormorant Garamond", serif';
  ctx.fillText('罗德岛 · 灵魂共振', W / 2, 70);

  // Large names
  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 72px "Cormorant Garamond", serif';
  ctx.fillText(op1.name, W / 2, 170);
  ctx.fillText(op2.name, W / 2, 260);

  // Diamond connector
  ctx.fillStyle = 'rgba(245,230,92,0.4)'; ctx.font = '40px serif';
  ctx.fillText('⬡', W / 2, 228);

  // Subtitles
  ctx.fillStyle = '#B8B0A0'; ctx.font = '24px "Noto Sans SC", sans-serif';
  ctx.fillText(op1.title, W / 2, 310);
  ctx.fillText(op2.title, W / 2, 350);

  // Divider
  ctx.strokeStyle = 'rgba(245,230,92,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(160, 400); ctx.lineTo(W - 160, 400); ctx.stroke();

  // Dual radar — no legend, clean
  drawDualRadarClean(ctx, W / 2, 580, 240, coords1, op1.color, coords2, op2.color);

  // Compatibility — big
  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 96px "Cormorant Garamond", serif';
  ctx.fillText(`${compat}%`, W / 2, 880);
  ctx.fillStyle = '#8A8270'; ctx.font = '26px "Cormorant Garamond", serif';
  ctx.fillText('灵魂兼容度', W / 2, 920);

  // CP line
  ctx.fillStyle = '#B8B0A0'; ctx.font = '22px "Noto Sans SC", sans-serif';
  const cpText = compat >= 80 ? '你们的灵魂频率在同一波段。' : compat >= 60 ? '截然不同的战场风格，恰好彼此互补。' : '相隔很远的频率，自有引力。';
  ctx.fillText(cpText, W / 2, 970);

  // Hex QR
  const shareUrl = `${window.location.origin}/arknights-personality-v2/`;
  await drawHexQR(ctx, shareUrl, W / 2, 1100, 100);

  // Footer
  ctx.fillStyle = '#5A5040'; ctx.font = '14px "Cormorant Garamond", serif';
  ctx.fillText('扫码开始测试 · R.I. Personality Quiz', W / 2, H - 40);

  return canvas.toDataURL('image/jpeg', 0.85);
}

/** Clean dual radar — no legend labels, just visual overlay */
function drawDualRadarClean(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number,
  coords1: number[], color1: string, coords2: number[], color2: string,
) {
  const angles = DIM_LABELS.map((_, i) => (i * 72 - 90) * Math.PI / 180);
  // Grid
  for (let ring = 1; ring <= 5; ring++) {
    const r = (radius / 5) * ring;
    ctx.beginPath();
    angles.forEach((a, i) => i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)) : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)));
    ctx.closePath();
    ctx.strokeStyle = `rgba(232,227,216,${0.04 + ring * 0.03})`; ctx.lineWidth = 0.5; ctx.stroke();
  }
  // Axes
  angles.forEach(a => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a)); ctx.strokeStyle = 'rgba(232,227,216,0.06)'; ctx.lineWidth = 0.5; ctx.stroke(); });
  // Labels (smaller, dimmer)
  ctx.textAlign = 'center'; ctx.fillStyle = '#6A6050'; ctx.font = '14px "Noto Sans SC", sans-serif';
  angles.forEach((a, i) => { const x = cx + (radius + 32) * Math.cos(a); const y = cy + (radius + 32) * Math.sin(a); ctx.fillText(DIM_LABELS[i], x, y + 4); });
  // Person 1
  ctx.beginPath();
  angles.forEach((a, i) => { const r = (coords1[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.closePath(); ctx.fillStyle = color1 + '20'; ctx.fill(); ctx.strokeStyle = color1; ctx.lineWidth = 2; ctx.stroke();
  // Person 2
  ctx.beginPath();
  angles.forEach((a, i) => { const r = (coords2[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.closePath(); ctx.fillStyle = color2 + '20'; ctx.fill(); ctx.setLineDash([8, 5]); ctx.strokeStyle = color2; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
}

/** Rhodes Island identity archive wallpaper (750×1334) */
export async function generateIdentityArchive(
  op: Operator, userCoords: number[], _compatible: number, opLabels: string[] = DIM_LABELS,
): Promise<string> {
  const W = 750, H = 1334;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  // Dark industrial bg
  ctx.fillStyle = '#0D0F11'; ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(232,227,216,0.02)'; ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Header bar
  ctx.fillStyle = '#1A1C1E'; ctx.fillRect(0, 0, W, 80);
  ctx.strokeStyle = 'rgba(232,227,216,0.08)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(W, 80); ctx.stroke();

  ctx.fillStyle = '#8A8270'; ctx.font = '14px "Cormorant Garamond", serif';
  ctx.textAlign = 'left'; ctx.fillText('RHODES ISLAND', 40, 35);
  ctx.fillText('PERSONNEL ARCHIVE', 40, 55);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#6A6050'; ctx.font = '12px monospace';
  const ts = Date.now().toString(36).toUpperCase();
  ctx.fillText(`FILE NO. RI-${ts}-${op.id.toUpperCase().slice(0, 4)}`, W - 40, 35);
  ctx.fillText('SECURITY LEVEL: CONFIDENTIAL', W - 40, 55);

  // Operator portrait
  const avatarImg = await loadImg(IMG + 'avatar/' + op.avatar.replace('#', '%23') + '.jpg');
  if (avatarImg) {
    ctx.save(); ctx.beginPath();
    ctx.arc(W / 2, 220, 100, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    ctx.drawImage(avatarImg, W / 2 - 100, 120, 200, 200);
    ctx.restore();
    // Ring
    ctx.beginPath(); ctx.arc(W / 2, 220, 102, 0, Math.PI * 2);
    ctx.strokeStyle = op.color; ctx.lineWidth = 2; ctx.stroke();
  }

  // Codename
  ctx.textAlign = 'center';
  ctx.fillStyle = '#E8E3D8'; ctx.font = 'bold 42px "Cormorant Garamond", serif';
  ctx.fillText(op.name, W / 2, 360);

  ctx.fillStyle = '#8A8270'; ctx.font = '20px "Noto Sans SC", sans-serif';
  ctx.fillText(op.title, W / 2, 392);

  // Class badge
  ctx.fillStyle = op.color; ctx.font = '14px "Cormorant Garamond", serif';
  ctx.strokeStyle = op.color + '40'; ctx.lineWidth = 1;
  const classW = ctx.measureText(op.clazz).width + 20;
  ctx.strokeRect(W / 2 - classW / 2, 410, classW, 26);
  ctx.fillText(op.clazz, W / 2, 428);

  // Divider
  ctx.strokeStyle = 'rgba(232,227,216,0.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 460); ctx.lineTo(W - 60, 460); ctx.stroke();

  // Combat Assessment (radar)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A8270'; ctx.font = '16px "Cormorant Garamond", serif';
  ctx.fillText('COMBAT ASSESSMENT', W / 2, 500);
  drawRadar(ctx, W / 2, 640, 150, userCoords, op.coords, op.color, opLabels);

  // Dimension bars
  let by = 850;
  opLabels.forEach((label, i) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8A8270'; ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillText(label, 80, by);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#6A6050'; ctx.font = '12px monospace';
    ctx.fillText(`${userCoords[i]}/10`, W - 80, by);

    // Bar
    ctx.fillStyle = 'rgba(232,227,216,0.06)';
    ctx.fillRect(80, by + 4, W - 160, 6);
    ctx.fillStyle = op.color + '80';
    ctx.fillRect(80, by + 4, (W - 160) * userCoords[i] / 10, 6);

    by += 34;
  });

  // Personnel Assessment
  ctx.strokeStyle = 'rgba(232,227,216,0.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, by + 10); ctx.lineTo(W - 60, by + 10); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A8270'; ctx.font = '16px "Cormorant Garamond", serif';
  ctx.fillText('PERSONNEL ASSESSMENT', W / 2, by + 40);

  ctx.fillStyle = '#B8B0A0'; ctx.font = '16px "Noto Sans SC", sans-serif';
  const descLines = wrapText(ctx, op.desc, W - 120);
  descLines.forEach((l, i) => { ctx.fillText(l, W / 2, by + 70 + i * 24); });

  // Footer
  ctx.fillStyle = '#1A1C1E'; ctx.fillRect(0, H - 60, W, 60);
  ctx.fillStyle = '#5A5040'; ctx.font = '12px "Cormorant Garamond", serif';
  ctx.textAlign = 'center';
  ctx.fillText('RHODES ISLAND · ARKNIGHTS PERSONALITY QUIZ · R.I. v3.0', W / 2, H - 30);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/** Build challenge URL encoding both people's coords */
export function buildChallengeUrl(userCoords: number[]): string {
  return `${window.location.origin}/arknights-personality-v2/?c=${userCoords.join(',')}&challenge=1`;
}

/** Build compare URL for two sets of coords */
export function buildCompareUrl(u1: number[], u2: number[]): string {
  return `${window.location.origin}/arknights-personality-v2/?c=${u1.join(',')}&u2=${u2.join(',')}`;
}

/** Default share URL */
export function buildShareUrl(userCoords: number[]): string {
  return `${window.location.origin}/arknights-personality-v2/?c=${userCoords.join(',')}`;
}
