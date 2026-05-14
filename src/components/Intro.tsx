import { motion } from 'framer-motion';

interface IntroProps {
  onStart: () => void;
  onRandom: () => void;
}

export default function Intro({ onStart, onRandom }: IntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-9 py-20 text-center"
    >
      <div className="w-full max-w-xs">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo - subtle hex */}
          <div className="font-serif-en text-sm tracking-[0.4em] text-warm-dim mb-2">
            R.I.
          </div>
          <div className="font-serif-en italic text-xs tracking-[0.15em] text-warm-muted mb-12">
            — a personality map of Rhodes Island —
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="font-serif-en text-5xl font-normal tracking-[0.08em] leading-tight text-white mb-4">
            R.I.
          </h1>
          <p className="text-xl font-normal tracking-[0.3em] text-warm-white mb-12">
            罗德岛干员人格测试
          </p>

          <p className="font-serif-cn text-sm leading-relaxed text-warm-muted max-w-[280px] mx-auto mb-2">
            战场上的选择，照见你灵魂的形状。<br />
            十五道战术情境题，<em className="font-serif-en italic text-warm-dim">找到与你的频率共振的那位干员。</em>
          </p>

          <div className="ornament">· · ·</div>

          <p className="font-serif-en italic text-xs tracking-[0.15em] text-warm-dim mb-8">
            16 operators · 15 questions · 3 min
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <button
            onClick={onStart}
            className="inline-block px-14 py-4 bg-white text-deep-900 font-serif-cn text-sm tracking-[0.3em] cursor-pointer transition-all duration-300 hover:bg-warm-white active:scale-[0.97]"
          >
            开 始 测 试
          </button>

          <p className="font-serif-en italic text-xs tracking-[0.1em] text-warm-dim mt-4">
           请在安静的时刻打开
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-16"
        >
          <button
            onClick={onRandom}
            className="font-serif-cn text-xs tracking-[0.16em] text-warm-dim border-b border-transparent border-dotted cursor-pointer transition-all duration-200 hover:text-warm-muted hover:border-warm-dim bg-transparent pb-0.5"
          >
            ⚡ 直接看结果
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
