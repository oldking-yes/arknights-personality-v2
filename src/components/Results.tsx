import { useState } from 'react';
import { motion } from 'framer-motion';
import RadarChart from './RadarChart';
import { DIM_LABELS } from '../data/types';
import type { MatchResult } from '../utils/matching';

interface ResultsProps {
  result: MatchResult;
  onRestart: () => void;
}

const cdn = 'https://cdn.jsdelivr.net/gh/fexli/ArknightsResource@latest/portrait/';

export default function Results({ result, onRestart }: ResultsProps) {
  const { op, compatible, userCoords } = result;
  const imgUrl = cdn + op.avatar + '.png';
  const [showShare, setShowShare] = useState(false);
  const [shareImg, setShareImg] = useState('');

  const items = DIM_LABELS.map((label, i) => ({
    label, user: userCoords[i], op: op.coords[i]
  }));

  const generateShareCard = async () => {
    try {
      const el = document.getElementById('result-content');
      if (!el) return;
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        backgroundColor: '#0D0F11',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImg(dataUrl);
      setShowShare(true);
    } catch {}
  };

  const downloadCard = () => {
    if (!shareImg) return;
    const a = document.createElement('a');
    a.download = `arknights-${op.id}.png`;
    a.href = shareImg;
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
        {/* Hero section - portrait as background */}
        <div className="relative w-full overflow-hidden mb-0" style={{ minHeight: '70vh' }}>
          {/* Portrait background */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <img
              src={imgUrl}
              alt=""
              className="w-full h-full object-cover opacity-30"
              style={{ filter: 'brightness(0.5) saturate(0.8)', objectPosition: 'top center' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(13,15,17,0.3) 0%, rgba(13,15,17,0.6) 60%, #0D0F11 100%)'
            }} />
          </div>

          {/* Content on top of portrait */}
          <div className="relative z-10 flex flex-col items-center justify-end min-h-[70vh] px-8 pb-8 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              <div className="font-serif-en italic text-sm tracking-[0.15em] text-warm-dim mb-3">
                与你灵魂共振的干员
              </div>
              <h2 className="font-serif-en text-6xl font-normal tracking-[0.08em] text-white mb-2">
                {op.name}
              </h2>
              <p className="text-lg tracking-[0.08em] text-warm-muted mb-6">
                {op.title}
              </p>
              <div className="ornament" style={{ margin: '16px 0' }}>· · ·</div>
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
                  onClick={downloadCard}
                  className="px-8 py-3 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.2em] cursor-pointer transition-all duration-300 hover:bg-warm-white"
                >
                  保存图片
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(`我在罗德岛干员人格测试中匹配到了「${op.name}」！适配度 ${compatible}% —— 你也来测测看！`); }}
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
