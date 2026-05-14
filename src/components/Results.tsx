import { useState } from 'react';
import { motion } from 'framer-motion';
import RadarChart from './RadarChart';
import { DIM_LABELS } from '../data/types';
import type { MatchResult } from '../utils/matching';

interface ResultsProps {
  result: MatchResult;
  onRestart: () => void;
}

const charCdn = 'https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/portrait/';

export default function Results({ result, onRestart }: ResultsProps) {
  const { op, compatible, userCoords } = result;
  const charUrl = charCdn + op.avatar + '_1.png';
  const [showShare, setShowShare] = useState(false);
  const [shareImg, setShareImg] = useState('');

  const items = DIM_LABELS.map((label, i) => ({
    label, user: userCoords[i], op: op.coords[i]
  }));

  const generateShareCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0D0F11';
    ctx.fillRect(0, 0, 800, 1000);

    ctx.strokeStyle = 'rgba(232,227,216,0.04)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 16; c++) {
        const cx = c * 52 + (r % 2) * 26, cy = r * 45;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 - 30) * Math.PI / 180;
          const x = cx + 24 * Math.cos(a), y = cy + 24 * Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
    }

    const grad = ctx.createRadialGradient(400, 200, 20, 400, 200, 400);
    grad.addColorStop(0, op.color + '30');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#8A8270';
    ctx.font = '16px "Cormorant Garamond", serif';
    ctx.fillText('与你灵魂共振的干员', 400, 80);
    ctx.fillStyle = '#E8E3D8';
    ctx.font = 'bold 64px "Cormorant Garamond", serif';
    ctx.fillText(op.name, 400, 170);
    ctx.fillStyle = '#B8B0A0';
    ctx.font = '18px "Noto Sans SC", sans-serif';
    ctx.fillText(op.title, 400, 210);
    ctx.fillStyle = 'rgba(232,227,216,0.2)';
    ctx.fillRect(300, 240, 200, 1);

    ctx.fillStyle = '#D0C8B8';
    ctx.font = '15px "Noto Sans SC", sans-serif';
    let ty = 280;
    op.persona.slice(0, 2).forEach(t => {
      const words = t.split('');
      let line = '', ly = ty;
      for (const ch of words) {
        if (ctx.measureText(line + ch).width > 520) {
          ctx.fillText(line, 400, ly); line = ch; ly += 24;
        } else line += ch;
      }
      if (line) ctx.fillText(line, 400, ly);
      ty = ly + 36;
    });

    ty += 16;
    ctx.fillStyle = '#8A8270';
    ctx.font = '20px "Cormorant Garamond", serif';
    ctx.fillText(`适配度 ${compatible}%`, 400, ty);
    ty += 44;
    op.tags.slice(0, 4).forEach((tag, i) => {
      const x = 200 + i * 110;
      ctx.strokeStyle = 'rgba(232,227,216,0.2)';
      ctx.lineWidth = 1;
      const tw = ctx.measureText(tag).width + 24;
      ctx.strokeRect(x - tw / 2, ty - 10, tw, 28);
      ctx.fillStyle = '#B8B0A0';
      ctx.font = '14px "Cormorant Garamond", serif';
      ctx.fillText(tag, x, ty + 5);
    });

    ctx.fillStyle = '#6A6050';
    ctx.font = '12px "Cormorant Garamond", serif';
    ctx.fillText('罗德岛干员人格测试 · R.I. Personality Quiz', 400, 950);
    ctx.font = '10px "Cormorant Garamond", serif';
    ctx.fillStyle = '#5A5040';
    ctx.fillText('arknights-personality-v2', 400, 975);

    const dataUrl = canvas.toDataURL('image/png');
    setShareImg(dataUrl);
    setShowShare(true);
    const a = document.createElement('a');
    a.download = `arknights-${op.id}.png`;
    a.href = dataUrl;
    a.click();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="result-content"
        className="flex flex-col items-center min-h-screen px-0 py-0"
      >
        {/* Hero section - full character art background */}
        <div className="relative w-full overflow-hidden mb-0" style={{ minHeight: '85vh' }}>
          {/* Character art */}
          <div className="absolute inset-0 z-0 flex items-start justify-center">
            <img
              src={charUrl}
              alt=""
              className="w-full h-full object-contain opacity-60"
              style={{ filter: 'brightness(0.65) saturate(1)', objectPosition: 'center 20%' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(13,15,17,0.1) 0%, rgba(13,15,17,0.5) 50%, #0D0F11 100%)'
            }} />
          </div>

          {/* Content on top */}
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
                {op.tag} · {op.clazz}
              </div>
              <div className="ornament" style={{ margin: '8px 0' }}>· · ·</div>
            </motion.div>
          </div>
        </div>

        {/* Persona section */}
        <div className="w-full max-w-md px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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

          {/* Soul card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="soul-card">
              <div className="soul-label">灵魂起源</div>
              <div className="soul-name">{op.name}</div>
              <div className="soul-name-cn">{op.title}</div>
              {op.soul.map((t, i) => (
                <p key={i} className="soul-text" dangerouslySetInnerHTML={{ __html: t }} />
              ))}
            </div>
          </motion.div>

          {/* Match + Dimensions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <div className="section-label">适配度</div>
            <div className="text-center mb-6">
              <span className="font-serif-en text-5xl text-white">{compatible}</span>
              <span className="font-serif-en text-lg text-warm-dim">%</span>
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <RadarChart user={userCoords} operator={op.coords} color={op.color} opName={op.name} />
          </motion.div>

          {/* Dimension bars */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6"
          >
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

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center gap-3 pb-12"
          >
            <button
              onClick={generateShareCard}
              className="inline-block px-10 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.25em] cursor-pointer transition-all duration-300 hover:bg-warm-white active:scale-[0.97]"
            >
              生成分享卡片
            </button>
            <button
              onClick={onRestart}
              className="bg-transparent text-warm-dim font-serif-cn text-xs tracking-[0.2em] cursor-pointer border-b border-dotted border-warm-dim/40 pb-0.5 transition-all duration-200 hover:text-warm-muted hover:border-warm-muted"
            >
              重新测试
            </button>
          </motion.div>
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
                  onClick={() => { navigator.clipboard.writeText(`我在罗德岛干员人格测试中匹配到了「${op.name}」！适配度 ${compatible}% —— 你也来测测看！ https://oldking-yes.github.io/arknights-personality-v2/`); }}
                  className="px-8 py-3 bg-transparent text-warm-muted border border-white/20 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:text-warm-white hover:border-white/40"
                >
                  复制分享
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
