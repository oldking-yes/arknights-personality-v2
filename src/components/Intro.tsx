import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface IntroProps {
  onStart: () => void;
  onRandom: () => void;
  onShowAll: () => void;
  onPrtsToggle: () => void;
}

const HAND_WHISPERS = [
  '「不准忘记我。」',
  '「我在时间的尽头等你。」',
  '「信号源……来自██。」',
  '「就算海洋沸腾，我们也一样能再见面。」',
  '「你曾许诺，当群星的余晖再次坠向泰拉——」',
  '「源石语言解码中…… 进度 87%」',
];

export default function Intro({ onStart, onRandom, onShowAll, onPrtsToggle }: IntroProps) {
  const [whisper, setWhisper] = useState('');
  const [whisperKey, setWhisperKey] = useState(0);
  const handRef = useRef<HTMLButtonElement>(null);
  const [toastPos, setToastPos] = useState({ left: 0, top: 0 });

  // Console easter egg — priestess messages, only on intro page
  useEffect(() => {
    const priestessLines = [
      ['%c𐂂 PRTS: 检测到博士的访问记录', 'color:#4A8FE4;font-size:11px'],
      ['%c𐂂 「不准忘记我。」', 'color:#6688ff;font-size:13px;font-style:italic'],
      ['%c𐂂 PRTS: 信号来源——██ ████ ███', 'color:#4A8FE4;font-size:11px'],
      ['%c𐂂 「就算海洋沸腾、大气消失，我们也一样能再见面。」', 'color:#6688ff;font-size:13px;font-style:italic'],
      ['%c𐂂 PRTS: 源石语言解码中…… 进度 87%', 'color:#4A8FE4;font-size:11px'],
      ['%c𐂂 通信终端: ▇▇▇▇ 正在连接……', 'color:#6A6050;font-size:10px'],
      ['%c𐂂 你曾许诺，当群星的余晖再次坠向泰拉——你会为我停下那束光。', 'color:#6688ff;font-size:12px;font-style:italic'],
      ['%c𐂂 PRTS: 连接丢失。', 'color:#4A8FE4;font-size:11px'],
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    priestessLines.forEach((line, i) => {
      timers.push(setTimeout(() => console.log(line[0], line[1]), 3000 + i * 4000));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleHandClick = () => {
    const msg = HAND_WHISPERS[Math.floor(Math.random() * HAND_WHISPERS.length)];
    setWhisper(msg);
    setWhisperKey(k => k + 1);
    // Position toast relative to hand button
    if (handRef.current) {
      const rect = handRef.current.getBoundingClientRect();
      setToastPos({ left: rect.right + 12, top: rect.top });
    }
    setTimeout(() => setWhisper(''), 3500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-9 py-20 text-center relative overflow-hidden"
    >
      {/* PRTS hex — clickable to invoke terminal */}
      <button onClick={onPrtsToggle}
        className="fixed prts-hex cursor-pointer select-none z-10 transition-all duration-300 hover:scale-110 hover:opacity-80"
        style={{ color: 'rgba(74, 143, 228, 0.2)', top: '10%', left: '5%', width: '120px', height: '120px' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.8">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
          <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" strokeWidth="0.4" />
          <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.3" />
          <line x1="5" y1="50" x2="95" y2="50" strokeWidth="0.3" />
          <line x1="27.5" y1="17.5" x2="72.5" y2="82.5" strokeWidth="0.3" />
          <line x1="72.5" y1="17.5" x2="27.5" y2="82.5" strokeWidth="0.3" />
        </svg>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.4rem] tracking-[0.2em] text-blue-accent/30 whitespace-nowrap">
          PRTS
        </span>
      </button>
      <div className="fixed pointer-events-none select-none prts-hex"
        style={{ color: 'rgba(245, 230, 92, 0.06)', bottom: '15%', right: '8%', width: '80px', height: '80px', animationDelay: '2s' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.8">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
          <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" strokeWidth="0.4" />
        </svg>
      </div>

      {/* Hand reaching motif — clickable for Priestess whisper */}
      <button ref={handRef} onClick={handleHandClick}
        className="fixed hand-reach cursor-pointer select-none z-10 transition-all duration-300 hover:scale-110 hover:opacity-80"
        style={{ color: 'rgba(74, 143, 228, 0.12)', bottom: '8%', left: '3%', width: '60px', height: '80px' }}>
        <svg viewBox="0 0 60 80" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M30,5 C30,5 20,20 15,35 C12,45 16,52 22,52 C26,52 28,48 28,48
            L28,62 C28,68 32,72 34,72 C36,72 38,68 38,62 L38,48
            C40,50 44,52 48,48 C50,44 48,38 45,32 C42,26 38,12 36,6 Z"
          />
          <path d="M22,52 C18,55 14,58 18,62 C22,66 28,62 28,62" strokeWidth="0.8" />
        </svg>
      </button>

      {/* Priestess whisper toast — positioned dynamically relative to hand */}
      <AnimatePresence>
        {whisper && (
          <motion.div
            key={whisperKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-20 pointer-events-none"
            style={{ left: toastPos.left, top: toastPos.top }}
          >
            <div className="font-mono text-[0.55rem] tracking-wider italic px-3 py-1.5"
              style={{
                color: '#6688ff',
                background: 'rgba(13,15,17,0.85)',
                borderLeft: '2px solid rgba(102,136,255,0.3)',
                maxWidth: '200px',
              }}>
              {whisper}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          className="mt-16 flex flex-col items-center gap-3"
        >
          <button
            onClick={onRandom}
            className="font-serif-cn text-xs tracking-[0.16em] text-warm-dim border-b border-transparent border-dotted cursor-pointer transition-all duration-200 hover:text-warm-muted hover:border-warm-dim bg-transparent pb-0.5"
          >
            ⚡ 直接看结果
          </button>
          <button
            onClick={onShowAll}
            className="font-mono text-[0.55rem] tracking-widest text-warm-dim/40 cursor-pointer transition-all duration-200 hover:text-warm-dim/70 bg-transparent border border-white/5 px-3 py-1"
          >
            DEBUG · 全部干员
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
