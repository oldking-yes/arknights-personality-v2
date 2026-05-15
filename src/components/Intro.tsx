import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toggleLang } from '../i18n';

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
  const { t } = useTranslation();
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
      {/* PRTS hex — rotating concentric rings with vertex dots, clickable for terminal */}
      <button onClick={onPrtsToggle}
        className="fixed cursor-pointer select-none z-10 transition-all duration-500 hover:scale-110 hover:opacity-80 hex-glow"
        style={{ top: '10%', left: '5%', width: '130px', height: '130px' }}>
        <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
          {/* Outer ring — slow */}
          <g className="hex-spin-slow">
            <polygon points="60,5 107,32.5 107,87.5 60,115 13,87.5 13,32.5"
              stroke="rgba(74,143,228,0.12)" strokeWidth="0.6" />
            <polygon points="60,5 107,32.5 107,87.5 60,115 13,87.5 13,32.5"
              stroke="rgba(74,143,228,0.08)" strokeWidth="0.2"
              transform="scale(1.15) translate(-7.5,-7.5)" />
            {/* Vertex dots */}
            {[0,60,120,180,240,300].map((a,i) => {
              const rad = a * Math.PI / 180;
              const cx = 60 + 45 * Math.sin(rad);
              const cy = 60 - 45 * Math.cos(rad);
              return <circle key={i} cx={cx} cy={cy} r="1.5" fill="rgba(74,143,228,0.25)" />;
            })}
          </g>
          {/* Middle ring — reverse */}
          <g className="hex-spin-mid">
            <polygon points="60,17 93,34 93,86 60,103 27,86 27,34"
              stroke="rgba(74,143,228,0.09)" strokeWidth="0.5" />
            {[0,60,120,180,240,300].map((a,i) => {
              const rad = a * Math.PI / 180;
              const cx = 60 + 33 * Math.sin(rad);
              const cy = 60 - 33 * Math.cos(rad);
              return <circle key={i} cx={cx} cy={cy} r="1" fill="rgba(74,143,228,0.2)" />;
            })}
          </g>
          {/* Inner ring — fast */}
          <g className="hex-spin-fast">
            <polygon points="60,27 80,38 80,82 60,93 40,82 40,38"
              stroke="rgba(74,143,228,0.06)" strokeWidth="0.4" />
          </g>
          {/* Center dot */}
          <circle cx="60" cy="60" r="1.5" fill="rgba(74,143,228,0.3)" />
          {/* Crosshair */}
          <line x1="58" y1="60" x2="62" y2="60" stroke="rgba(74,143,228,0.08)" strokeWidth="0.5" />
          <line x1="60" y1="58" x2="60" y2="62" stroke="rgba(74,143,228,0.08)" strokeWidth="0.5" />
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

      {/* PRTS constellation hand — reaching hologram, clickable for Priestess whisper */}
      <button ref={handRef} onClick={handleHandClick}
        className="fixed hand-reach cursor-pointer select-none z-10 transition-all duration-500 hover:scale-110 hover:opacity-90"
        style={{ bottom: '8%', left: '2%', width: '90px', height: '110px' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Joint connections (wireframe mesh) */}
          <g stroke="rgba(74,143,228,0.2)" strokeWidth="0.5">
            {/* Wrist */}
            <line x1="15" y1="85" x2="30" y2="78" />
            <line x1="30" y1="78" x2="45" y2="85" />
            {/* Palm */}
            <line x1="30" y1="78" x2="30" y2="65" />
            <line x1="18" y1="70" x2="42" y2="70" />
            <line x1="30" y1="65" x2="18" y2="70" />
            <line x1="30" y1="65" x2="42" y2="70" />
            <line x1="15" y1="85" x2="18" y2="70" />
            <line x1="45" y1="85" x2="42" y2="70" />
            {/* Thumb */}
            <line x1="18" y1="70" x2="14" y2="60" />
            <line x1="14" y1="60" x2="10" y2="48" />
            {/* Index */}
            <line x1="18" y1="70" x2="22" y2="52" />
            <line x1="30" y1="65" x2="22" y2="52" />
            <line x1="22" y1="52" x2="20" y2="38" />
            <line x1="20" y1="38" x2="22" y2="22" />
            {/* Middle */}
            <line x1="30" y1="65" x2="30" y2="50" />
            <line x1="30" y1="50" x2="30" y2="34" />
            <line x1="30" y1="34" x2="32" y2="18" />
            {/* Ring */}
            <line x1="42" y1="70" x2="38" y2="52" />
            <line x1="30" y1="65" x2="38" y2="52" />
            <line x1="38" y1="52" x2="40" y2="38" />
            <line x1="40" y1="38" x2="44" y2="24" />
            {/* Pinky */}
            <line x1="42" y1="70" x2="44" y2="56" />
            <line x1="44" y1="56" x2="50" y2="46" />
            <line x1="50" y1="46" x2="54" y2="36" />
            {/* Cross palm connections */}
            <line x1="22" y1="52" x2="30" y2="50" />
            <line x1="30" y1="50" x2="38" y2="52" />
          </g>

          {/* Joint dots */}
          <g fill="rgba(74,143,228,0.35)">
            {/* Wrist */}
            <circle cx="15" cy="85" r="1.2" />
            <circle cx="30" cy="78" r="1.5" />
            <circle cx="45" cy="85" r="1.2" />
            {/* Palm */}
            <circle cx="30" cy="65" r="1.8" />
            <circle cx="18" cy="70" r="1.2" />
            <circle cx="42" cy="70" r="1.2" />
            {/* Thumb */}
            <circle cx="14" cy="60" r="1" />
            <circle cx="10" cy="48" r="1.2" />
            {/* Index */}
            <circle cx="22" cy="52" r="1.2" />
            <circle cx="20" cy="38" r="1" />
            <circle cx="22" cy="22" r="1.2" />
            {/* Middle */}
            <circle cx="30" cy="50" r="1.2" />
            <circle cx="30" cy="34" r="1" />
            <circle cx="32" cy="18" r="1.2" />
            {/* Ring */}
            <circle cx="38" cy="52" r="1.2" />
            <circle cx="40" cy="38" r="1" />
            <circle cx="44" cy="24" r="1.2" />
            {/* Pinky */}
            <circle cx="44" cy="56" r="1" />
            <circle cx="50" cy="46" r="1" />
            <circle cx="54" cy="36" r="1.2" />
          </g>

          {/* Palm center glow */}
          <circle cx="30" cy="65" r="3" fill="rgba(74,143,228,0.1)" />
          <circle cx="30" cy="65" r="1.5" fill="rgba(74,143,228,0.2)" />

          {/* Expanding pulse ring */}
          <circle cx="30" cy="65" r="3" stroke="rgba(74,143,228,0.3)" strokeWidth="1"
            style={{ animation: 'pulseRing 3s ease-out infinite' }} />

          {/* Scanning line */}
          <rect x="4" y="0" width="54" height="1.5" rx="1" fill="rgba(74,143,228,0.15)"
            className="prts-scan" />

          {/* HUD corner brackets */}
          <path d="M2,4 L2,14 M2,4 L12,4" stroke="rgba(74,143,228,0.12)" strokeWidth="0.6" />
          <path d="M60,4 L60,14 M60,4 L50,4" stroke="rgba(74,143,228,0.12)" strokeWidth="0.6" />
          <path d="M2,98 L2,88 M2,98 L12,98" stroke="rgba(74,143,228,0.12)" strokeWidth="0.6" />
          <path d="M60,98 L60,88 M60,98 L50,98" stroke="rgba(74,143,228,0.12)" strokeWidth="0.6" />

          {/* Tech readout dots */}
          <circle cx="9" cy="2" r="0.5" fill="rgba(74,143,228,0.2)" />
          <circle cx="53" cy="2" r="0.5" fill="rgba(74,143,228,0.2)" />
        </svg>
      </button>

      {/* Floating hex particles */}
      <div className="fixed pointer-events-none select-none" style={{ bottom: '15%', left: '10%', width: '10px', height: '10px' }}>
        <svg viewBox="0 0 10 10" className="particle-1 w-full h-full" fill="none" stroke="rgba(74,143,228,0.15)" strokeWidth="0.6">
          <polygon points="5,0.5 9.5,3 9.5,7 5,9.5 0.5,7 0.5,3" />
        </svg>
      </div>
      <div className="fixed pointer-events-none select-none" style={{ bottom: '20%', right: '12%', width: '7px', height: '7px' }}>
        <svg viewBox="0 0 10 10" className="particle-2 w-full h-full" fill="none" stroke="rgba(74,143,228,0.12)" strokeWidth="0.5">
          <polygon points="5,0.5 9.5,3 9.5,7 5,9.5 0.5,7 0.5,3" />
        </svg>
      </div>
      <div className="fixed pointer-events-none select-none" style={{ top: '25%', right: '15%', width: '6px', height: '6px' }}>
        <svg viewBox="0 0 10 10" className="particle-3 w-full h-full" fill="none" stroke="rgba(74,143,228,0.1)" strokeWidth="0.5">
          <polygon points="5,0.5 9.5,3 9.5,7 5,9.5 0.5,7 0.5,3" />
        </svg>
      </div>
      <div className="fixed pointer-events-none select-none" style={{ top: '35%', left: '15%', width: '8px', height: '8px' }}>
        <svg viewBox="0 0 10 10" className="particle-4 w-full h-full" fill="none" stroke="rgba(74,143,228,0.12)" strokeWidth="0.5">
          <polygon points="5,0.5 9.5,3 9.5,7 5,9.5 0.5,7 0.5,3" />
        </svg>
      </div>

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
      {/* Language toggle */}
      <button onClick={toggleLang}
        className="fixed top-4 right-4 z-20 font-mono text-[0.55rem] tracking-widest text-warm-dim/50 hover:text-warm-dim transition-colors cursor-pointer border border-white/5 px-2 py-1">
        {t('langSwitch')}
      </button>

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
