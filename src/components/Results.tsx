import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import RadarChart from './RadarChart';
import { DIM_LABELS } from '../data/types';
import type { MatchResult } from '../utils/matching';

interface ResultsProps {
  result: MatchResult;
  onRestart: () => void;
}

const baseCdn = 'https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/';
const avatarCdn = baseCdn + 'avatar/';

function charUrl(op: { portrait?: string; avatar: string }, fallback: boolean) {
  if (op.portrait) {
    return op.portrait.startsWith('skin/')
      ? baseCdn + op.portrait.replace('#', '%23')
      : baseCdn + 'portrait/' + op.portrait;
  }
  return fallback
    ? baseCdn + 'portrait/' + op.avatar + '_1.png'
    : baseCdn + 'skin/' + op.avatar.replace('#', '%23') + '_2b.png';
}

/** Draw a pentagon radar chart onto a canvas context */
function drawRadar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  user: number[], opCoords: number[],
  opColor: string, labels: string[],
) {
  const angles = labels.map((_, i) => (i * 72 - 90) * Math.PI / 180);

  // Grid rings
  for (let ring = 1; ring <= 5; ring++) {
    const r = (radius / 5) * ring;
    ctx.beginPath();
    angles.forEach((a, i) => {
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = `rgba(232,227,216,${0.04 + ring * 0.03})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Axes
  angles.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.strokeStyle = 'rgba(232,227,216,0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Labels
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A8270';
  ctx.font = '11px "Noto Sans SC", sans-serif';
  angles.forEach((a, i) => {
    const x = cx + (radius + 24) * Math.cos(a);
    const y = cy + (radius + 24) * Math.sin(a);
    ctx.fillText(labels[i], x, y + 4);
  });

  // User data polygon
  ctx.beginPath();
  angles.forEach((a, i) => {
    const r = (user[i] / 10) * radius;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(232,227,216,0.15)';
  ctx.fill();
  ctx.strokeStyle = '#E8E3D8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Operator data polygon
  ctx.beginPath();
  angles.forEach((a, i) => {
    const r = (opCoords[i] / 10) * radius;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = opColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Data points on user polygon
  angles.forEach((a, i) => {
    const r = (user[i] / 10) * radius;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#E8E3D8';
    ctx.fill();
  });
}

export default function Results({ result, onRestart }: ResultsProps) {
  const { op, compatible, userCoords, ranking } = result;
  const [heroFallback, setHeroFallback] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const url = charUrl(op, heroFallback);
  const [showShare, setShowShare] = useState(false);
  const [shareImg, setShareImg] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  const items = DIM_LABELS.map((label, i) => ({
    label, user: userCoords[i], op: op.coords[i]
  }));

  const top3 = ranking.slice(0, 3);

  const shareUrl = `${window.location.origin}/arknights-personality-v2/?c=${userCoords.join(',')}`;

  const shareText = `我在罗德岛干员人格测试中匹配到了「${op.name}」！适配度 ${compatible}%\n「${op.title}」\n—— 你也来测测看，看看哪位干员与你灵魂共振。`;

  const isWechat = /MicroMessenger/i.test(navigator.userAgent);

  const generateShareCard = useCallback(async () => {
    if (shareLoading) return;
    setShareLoading(true);

    const W = 800, H = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setShareLoading(false); return; }

    // Background
    ctx.fillStyle = '#0D0F11';
    ctx.fillRect(0, 0, W, H);

    // Hex pattern bg
    ctx.strokeStyle = 'rgba(232,227,216,0.03)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 24; r++) {
      for (let c = 0; c < 18; c++) {
        const cx = c * 48 + (r % 2) * 24, cy = r * 40;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 - 30) * Math.PI / 180;
          const x = cx + 20 * Math.cos(a), y = cy + 20 * Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
    }

    // Radial glow
    const grad = ctx.createRadialGradient(400, 150, 20, 400, 150, 350);
    grad.addColorStop(0, op.color + '25');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 400);

    // Try loading avatar for card
    const avatarImg = await new Promise<HTMLImageElement | null>(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = avatarCdn + op.avatar.replace('#', '%23') + '.png';
    });

    // Avatar circle
    if (avatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(400, 70, 40, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 360, 30, 80, 80);
      ctx.restore();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#8A8270';
    ctx.font = '14px "Cormorant Garamond", serif';
    ctx.fillText('与你灵魂共振的干员', 400, avatarImg ? 140 : 80);

    ctx.fillStyle = '#E8E3D8';
    ctx.font = 'bold 56px "Cormorant Garamond", serif';
    ctx.fillText(op.name, 400, avatarImg ? 200 : 160);

    ctx.fillStyle = '#B8B0A0';
    ctx.font = '16px "Noto Sans SC", sans-serif';
    ctx.fillText(op.title, 400, avatarImg ? 235 : 200);

    // Radar chart area
    const radarCX = 400, radarCY = 420, radarR = 150;
    drawRadar(ctx, radarCX, radarCY, radarR, userCoords, op.coords, op.color, DIM_LABELS);

    // Legend
    ctx.font = '12px "Cormorant Garamond", serif';
    ctx.fillStyle = '#E8E3D8';
    ctx.fillRect(280, 530, 12, 12);
    ctx.fillText('你的坐标', 300, 540);
    ctx.strokeStyle = op.color;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(440, 530, 12, 12);
    ctx.setLineDash([]);
    ctx.fillStyle = op.color;
    ctx.fillText(op.name, 460, 540);

    // Compatibility
    ctx.fillStyle = '#E8E3D8';
    ctx.font = 'bold 36px "Cormorant Garamond", serif';
    ctx.fillText(`${compatible}%`, 400, 600);
    ctx.fillStyle = '#8A8270';
    ctx.font = '14px "Cormorant Garamond", serif';
    ctx.fillText('适配度', 400, 625);

    // Persona excerpt
    ctx.fillStyle = '#B8B0A0';
    ctx.font = '13px "Noto Sans SC", sans-serif';
    let ty = 670;
    op.persona.slice(0, 2).forEach(t => {
      let line = '', ly = ty;
      for (const ch of t) {
        const testLine = line + ch;
        if (ctx.measureText(testLine).width > 480) {
          ctx.fillText(line, 400, ly);
          line = ch;
          ly += 22;
        } else line = testLine;
      }
      if (line) ctx.fillText(line, 400, ly);
      ty = ly + 30;
    });

    // Tags
    ty += 12;
    op.tags.slice(0, 4).forEach((tag, i) => {
      const x = 160 + i * 130;
      ctx.strokeStyle = 'rgba(232,227,216,0.2)';
      ctx.lineWidth = 0.5;
      const tw = ctx.measureText(tag).width + 20;
      ctx.strokeRect(x - tw / 2, ty - 8, tw, 24);
      ctx.fillStyle = '#8A8270';
      ctx.font = '12px "Cormorant Garamond", serif';
      ctx.fillText(tag, x, ty + 7);
    });

    // Top 3 section
    ty += 50;
    ctx.fillStyle = '#6A6050';
    ctx.font = '11px "Cormorant Garamond", serif';
    ctx.fillText('— 其他匹配 —', 400, ty);
    ty += 24;
    ranking.slice(1, 4).forEach((m, i) => {
      ctx.fillStyle = '#8A8270';
      ctx.font = '14px "Cormorant Garamond", serif';
      ctx.fillText(`#${i + 2} ${m.op.name} · ${m.compatible}%`, 400, ty);
      ty += 22;
    });

    // Footer
    ctx.fillStyle = '#5A5040';
    ctx.font = '11px "Cormorant Garamond", serif';
    ctx.fillText('罗德岛干员人格测试 · R.I. Personality Quiz', 400, H - 50);
    ctx.font = '9px "Cormorant Garamond", serif';
    ctx.fillText(shareUrl, 400, H - 32);

    const dataUrl = canvas.toDataURL('image/png');
    setShareImg(dataUrl);
    setShowShare(true);
    setShareLoading(false);

    const a = document.createElement('a');
    a.download = `arknights-${op.id}.png`;
    a.href = dataUrl;
    a.click();
  }, [op, compatible, userCoords, ranking, shareLoading, shareUrl]);

  const handleWebShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '罗德岛干员人格测试', text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
      alert('分享链接已复制！' + (isWechat ? '\n请点击右上角 ··· 发送给朋友。' : ''));
    } catch {
      prompt('复制以下链接分享给好友：', shareUrl);
    }
  }, [shareText, shareUrl, isWechat]);

  const copyShareText = useCallback(() => {
    navigator.clipboard.writeText(shareText + '\n' + shareUrl);
  }, [shareText, shareUrl]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="result-content"
        className="flex flex-col items-center min-h-screen px-0 py-0"
      >
        {/* Hero section */}
        <div className="relative w-full overflow-hidden mb-0" style={{ minHeight: '85vh' }}>
          <div className="absolute inset-0 z-0 flex items-start justify-center">
            {!heroLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover opacity-70"
              style={{ filter: 'brightness(0.55) saturate(1.1)', objectPosition: 'center 25%' }}
              onLoad={() => setHeroLoaded(true)}
              onError={(e) => {
                if (!op.portrait && !heroFallback) setHeroFallback(true);
                else (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(13,15,17,0.1) 0%, rgba(13,15,17,0.5) 50%, #0D0F11 100%)'
            }} />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-end min-h-[85vh] px-8 pb-10 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="font-serif-en italic text-sm tracking-[0.15em] text-warm-dim mb-3">
                与你灵魂共振的干员
              </div>
              <h2 className="font-serif-en text-6xl font-normal tracking-[0.08em] text-white mb-2">
                {op.name}
              </h2>
              <p className="font-serif-cn text-base tracking-[0.08em] text-warm-muted mb-6">
                {op.title}
              </p>
              <div className="font-serif-en text-xs tracking-widest px-3 py-1 mb-4"
                style={{ color: op.color, border: `1px solid ${op.color}40` }}>
                {op.clazz}
              </div>
              <div className="ornament" style={{ margin: '8px 0' }}>· · ·</div>
            </motion.div>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full max-w-md px-6">
          {/* Persona */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="section-label">Persona</div>
            {op.persona.map((t, i) => (
              <p key={i} className="persona-text">{t}</p>
            ))}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {op.tags.map((t, i) => (
                <span key={i} className="tag">{t}</span>
              ))}
            </div>
          </motion.div>

          <div className="ornament">· · ·</div>

          {/* Epigraph */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            dangerouslySetInnerHTML={{ __html: op.epigraph ? `<div class="epigraph">${op.epigraph}</div>` : '' }}
          />

          <div className="ornament">· · ·</div>

          {/* Soul */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="soul-card">
              <div className="soul-label">灵魂起源</div>
              <div className="soul-name">{op.name}</div>
              <div className="soul-name-cn">{op.title}</div>
              {op.soul.map((t, i) => (
                <p key={i} className="soul-text" dangerouslySetInnerHTML={{ __html: t }} />
              ))}
            </div>
          </motion.div>

          {/* Compatibility + Radar */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8">
            <div className="section-label">适配度</div>
            <div className="text-center mb-6">
              <span className="font-serif-en text-5xl text-white">{compatible}</span>
              <span className="font-serif-en text-lg text-warm-dim">%</span>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
            <RadarChart user={userCoords} operator={op.coords} color={op.color} opName={op.name} />
          </motion.div>

          {/* Dimension bars */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="mt-6">
            <div className="section-label">维度</div>
            <div className="flex flex-col gap-3">
              {items.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-warm-dim">{item.label}</span>
                    <span className="font-mono text-[0.55rem] text-warm-dim/70">
                      你 {item.user} · {op.name} {item.op}
                    </span>
                  </div>
                  <div className="h-px bg-white/5 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                      style={{ width: `${item.user * 10}%`, background: 'rgba(232,227,216,0.5)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="ornament">· · ·</div>

          {/* Top 3 matches */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.95 }}>
            <div className="section-label">其他匹配</div>
            <div className="flex flex-col gap-2 mb-6">
              {top3.map((m, i) => (
                <div key={m.op.id}
                  className="match-card flex items-center gap-3 p-3 bg-white/5 border border-white/10 cursor-default">
                  <span className="font-serif-en text-lg text-warm-dim min-w-[1.5rem] text-center">
                    {i === 0 ? '◆' : `#${i + 1}`}
                  </span>
                  <span className="font-serif-en text-sm text-white min-w-0 truncate">
                    {m.op.name}
                  </span>
                  <span className="font-mono text-[0.55rem] text-warm-dim ml-auto shrink-0">
                    {m.compatible}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center gap-3 pb-6"
          >
            <button
              onClick={generateShareCard}
              disabled={shareLoading}
              className="inline-block px-10 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.25em] cursor-pointer transition-all duration-300 hover:bg-warm-white active:scale-[0.97] disabled:opacity-50"
            >
              {shareLoading ? '生成中...' : '生成分享卡片'}
            </button>
            <button
              onClick={handleWebShare}
              className="inline-block px-10 py-3 bg-transparent text-warm-muted border border-white/20 font-serif-cn text-sm tracking-[0.25em] cursor-pointer transition-all duration-300 hover:text-warm-white hover:border-white/40 active:scale-[0.97]"
            >
              {isWechat ? '微信分享 · 点击复制' : '分享给好友'}
            </button>
            <button
              onClick={onRestart}
              className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.2em] cursor-pointer border-b border-dotted border-warm-dim/40 pb-0.5 transition-all duration-200 hover:text-warm-muted hover:border-warm-muted"
            >
              重新测试
            </button>
          </motion.div>

          {/* WeChat hint */}
          {isWechat && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="font-serif-cn text-xs text-warm-dim text-center mb-8"
            >
              💡 点击「分享给好友」复制链接，然后点击右上角 <strong className="text-warm-muted">···</strong> 发送给朋友
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Share Modal */}
      {showShare && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(13,15,17,0.95)' }}
          onClick={() => setShowShare(false)}
        >
          <button
            className="absolute top-5 right-6 text-warm-white text-3xl font-serif-en cursor-pointer z-10"
            onClick={() => setShowShare(false)}
          >
            &times;
          </button>
          {shareImg && (
            <>
              <img src={shareImg} alt="分享卡片" className="max-w-[90%] max-h-[70vh] rounded shadow-2xl" />
              <div className="mt-6 flex gap-3">
                <button
                  onClick={generateShareCard}
                  className="px-8 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:bg-warm-white"
                >
                  保存图片
                </button>
                <button
                  onClick={copyShareText}
                  className="px-8 py-3 bg-transparent text-warm-muted border border-white/20 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:text-warm-white hover:border-white/40"
                >
                  复制分享文案
                </button>
              </div>
              {isWechat && (
                <p className="mt-4 font-serif-cn text-xs text-warm-dim text-center">
                  长按图片保存，或点击右上角 <strong className="text-warm-muted">···</strong> 分享给朋友
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
