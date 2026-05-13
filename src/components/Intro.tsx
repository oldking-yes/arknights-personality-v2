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
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex flex-col items-center justify-center min-h-screen px-5 text-center"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          {/* Logo hex */}
          <div className="w-20 h-24 mx-auto mb-6">
            <svg viewBox="0 0 120 140" className="w-full h-full">
              <polygon points="60,5 115,35 115,105 60,135 5,105 5,35" fill="none" stroke="#F5E65C" strokeWidth="1.5" opacity="0.6"/>
              <polygon points="60,20 100,42 100,98 60,120 20,98 20,42" fill="none" stroke="#F5E65C" strokeWidth="0.8" opacity="0.3"/>
              <text x="60" y="82" textAnchor="middle" fill="#F5E65C" fontFamily="sans-serif" fontSize="28" fontWeight="bold">R.I.</text>
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            罗德岛干员人格测试
          </h1>
          <p className="text-xs tracking-[0.25em] text-lemon uppercase mb-1">
            Arknights Operator Personality Assessment
          </p>
          <div className="w-14 h-0.5 mx-auto my-4 bg-gradient-to-r from-transparent via-lemon to-transparent" />

          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            15 道战术情境题 &#xB7; 5 维人格图谱 &#xB7; 16 位干员匹配<br />
            找到与你的灵魂共振的那位干员。
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-10 py-3.5 bg-lemon/15 border border-lemon/60 text-lemon font-mono text-sm tracking-widest uppercase cursor-pointer transition-all duration-300 hover:bg-lemon/25 hover:border-lemon hover:shadow-[0_0_20px_rgba(245,230,92,0.15)] active:scale-95"
          >
            &#x25B6; 开始测试
          </button>
          <button
            onClick={onRandom}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-slate-700 text-slate-500 font-mono text-xs tracking-widest uppercase cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-slate-500 hover:text-white active:scale-95"
          >
            &#x26A1; 直接看结果
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex gap-2 justify-center"
        >
          <span className="font-mono text-[0.55rem] tracking-widest px-2 py-1 border border-slate-700 text-slate-600 bg-white/[0.02]">
            VERSION 2.0
          </span>
          <span className="font-mono text-[0.55rem] tracking-widest px-2 py-1 border border-slate-700 text-slate-600 bg-white/[0.02]">
            RHODES ISLAND
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
