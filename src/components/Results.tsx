import { motion } from 'framer-motion';
import RadarChart from './RadarChart';
import { DIM_LABELS } from '../data/types';
import type { MatchResult } from '../utils/matching';

interface ResultsProps {
  result: MatchResult;
  onRestart: () => void;
}

export default function Results({ result, onRestart }: ResultsProps) {
  const { op, compatible, userCoords } = result;
  const cdn = 'https://cdn.jsdelivr.net/gh/fexli/ArknightsResource@latest/portrait/';
  const imgUrl = cdn + op.avatar + '.png';

  const shareResult = async () => {
    const text = `我在罗德岛干员人格测试中匹配到了「${op.name}」！适配度 ${compatible}% —— 你也来测测看！`;
    if (navigator.share) {
      try { await navigator.share({ title: '罗德岛干员人格测试', text }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('结果已复制到剪贴板，快去分享吧！');
        // Haptic-like visual feedback
      } catch {}
    }
  };

  const items = [
    { label: DIM_LABELS[0], user: userCoords[0], op: op.coords[0] },
    { label: DIM_LABELS[1], user: userCoords[1], op: op.coords[1] },
    { label: DIM_LABELS[2], user: userCoords[2], op: op.coords[2] },
    { label: DIM_LABELS[3], user: userCoords[3], op: op.coords[3] },
    { label: DIM_LABELS[4], user: userCoords[4], op: op.coords[4] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-8"
    >
      <div className="w-full max-w-md">
        {/* Share Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative bg-card-bg border border-lemon-dim p-5 text-center mb-3 overflow-hidden"
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${op.color}, transparent 60%)` }}
          />

          {/* Avatar */}
          <div className="relative z-10 w-[72px] h-[72px] mx-auto mb-3">
            <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full">
              <polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill={`${op.color}08`} stroke={op.color} strokeWidth="0.8" opacity="0.5"/>
              <polygon points="40,12 66,26 66,54 40,68 14,54 14,26" fill="none" stroke={op.color} strokeWidth="0.3" opacity="0.3"/>
            </svg>
            <img
              src={imgUrl}
              alt={op.name}
              className="absolute top-[6px] left-[6px] w-[60px] h-[60px] rounded-full object-cover z-10"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <h2 className="text-xl font-bold tracking-wider relative z-10" style={{ color: op.color }}>
            {op.name}
          </h2>
          <p className="font-mono text-[0.65rem] tracking-widest text-slate-500 mt-0.5 relative z-10">
            {op.title}
          </p>
          <p
            className="font-mono text-[0.6rem] tracking-wider inline-block px-2 py-0.5 mt-1.5 relative z-10"
            style={{ color: op.color, borderColor: `${op.color}40`, border: '1px solid' }}
          >
            {'★'.repeat(op.stars)} {op.clazz} &#xB7; {op.tag}
          </p>

          {/* Match percentage */}
          <p className="font-mono text-sm tracking-wider mt-3 relative z-10">
            适配度{' '}
            <span className="text-xl font-bold" style={{ color: op.color }}>{compatible}</span>%
          </p>
        </motion.div>

        {/* Dimension Bars */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card-bg border border-lemon-dim p-4 mb-3"
        >
          <p className="font-mono text-[0.6rem] tracking-[0.2em] text-slate-500 text-center mb-3 uppercase">
            维度对比 &#xB7; Dimension Comparison
          </p>
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="font-mono text-[0.6rem] text-slate-500">
                    你 {item.user} &#xB7; {op.name} {item.op}
                  </span>
                </div>
                <div className="h-2 bg-slate-700/40 rounded-full overflow-hidden relative">
                  {/* User bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${item.user * 10}%`, background: op.color, opacity: 0.7 }}
                  />
                  {/* Operator bar */}
                  <div
                    className="absolute top-0 bottom-0 rounded-full transition-all duration-700 ease-out delay-150"
                    style={{
                      width: `${item.op * 10}%`,
                      background: `repeating-linear-gradient(90deg, ${op.color}00, ${op.color}80 2px, transparent 2px, transparent 4px)`,
                      opacity: 0.5,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <RadarChart user={userCoords} operator={op.coords} color={op.color} opName={op.name} />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card-bg border border-lemon-dim p-4 mt-3"
        >
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-200">{op.name}</strong> — {op.desc}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex gap-3 justify-center mt-4"
        >
          <button
            onClick={shareResult}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/5 border border-slate-700 text-slate-500 font-mono text-xs tracking-wider uppercase cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-slate-500 hover:text-white active:scale-95"
          >
            &#x2295; 分享结果
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-lemon/15 border border-lemon/50 text-lemon font-mono text-xs tracking-wider uppercase cursor-pointer transition-all duration-200 hover:bg-lemon/25 hover:border-lemon active:scale-95"
          >
            &#x21BB; 重新测试
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
