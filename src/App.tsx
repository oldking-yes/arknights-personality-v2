import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import Quiz from './components/Quiz';
import Results from './components/Results';
import RadarChart from './components/RadarChart';
import { QUESTIONS } from './data/questions';
import { findBestMatch, findMatchFromCoords } from './utils/matching';
import { saveProgress, loadProgress, clearProgress } from './utils/storage';
import type { Stage, AnswerRecord, Operator } from './data/types';
import { OPERATORS } from './data/operators';

const TOTAL = QUESTIONS.length;

type AppStage = Stage | 'debug';

export default function App() {
  const [stage, setStage] = useState<AppStage>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0, 0]);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [result, setResult] = useState<ReturnType<typeof findBestMatch> | null>(null);
  const [sysIdx, setSysIdx] = useState(0);
  const keyBuf = useRef('');
  const [prtsActive, setPrtsActive] = useState(false);

  const SYS_MSGS = [
    'SYS: ACTIVE','SYS: MON3TR STANDBY','SYS: ORIGINIUM SAT 0.02%',
    'SYS: CHERNOBOG RESONANCE STABLE','SYS: RHODES ISLAND AIRSPACE CLEAR',
    'SYS: Babel Archive Lv.6','SYS: Endfield Signal WEAK',
    'SYS: PRTS Core Online','SYS: Kaltsit Monitoring',
    'SYS: S.W.E.E.P. Protocol Enabled',
    'SYS: ████ SIGNAL DETECTED','SYS: PRIESTESS.SYNC 68%',
    'SYS: ASSIMILATED UNIVERSE ECHO','SYS: ORIGINIUM LANG. DECRYPT',
    'SYS: ◆── 她正在注视着你','SYS: PCS CALIBRATION DELTA-7',
    'SYS: THE FELLER · φ UNKNOWN','SYS: 「不准忘记我」',
  ];

  useEffect(() => {
    const t = setInterval(() => setSysIdx(i => (i + 1) % SYS_MSGS.length), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    console.log('%c🟦 R.I. v2.0  罗德岛档案系统', 'font-size:16px;font-weight:bold;color:#E8E3D8');
    console.log('%c「记录即是存在。档案即是历史。」——凯尔希', 'font-size:12px;color:#8A8270');
    console.log('%c🔍 在 Endfield 的深处，有什么正在注视着你……', 'font-size:11px;color:#6A6050');
    console.log('%c💡 试试点击页面上的六边形和手部图案', 'font-size:10px;color:#5A5040');
  }, []);

  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      const resume = window.confirm('检测到未完成的测试，是否继续上次的进度？');
      if (resume) {
        setScores(saved.scores);
        setCurrentQ(saved.currentQ);
        setHistory(saved.history);
        setStage('quiz');
      } else {
        clearProgress();
      }
    }
  }, []);

  // Deep linking: ?c=5,9,6,5,7
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const coordsStr = params.get('c');
    if (coordsStr) {
      const coords = coordsStr.split(',').map(Number);
      if (coords.length === 5 && coords.every(n => !isNaN(n) && n >= 0 && n <= 10)) {
        const r = findMatchFromCoords(coords);
        setResult(r);
        setStage('results');
        // Clean URL without reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // PRTS terminal: type "prts" to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      keyBuf.current = (keyBuf.current + e.key).slice(-6);
      if (keyBuf.current.toLowerCase().includes('prts')) {
        setPrtsActive(a => !a);
        keyBuf.current = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const startQuiz = useCallback(() => {
    setCurrentQ(0); setScores([0,0,0,0,0]); setHistory([]); setResult(null); setStage('quiz');
  }, []);

  const showAll = useCallback(() => {
    setStage('debug');
  }, []);

  const randomQuiz = useCallback(() => {
    const rs = Array.from({length:5}, () => Math.floor(Math.random()*4)*3 + Math.floor(Math.random()*3));
    setScores(rs); setCurrentQ(TOTAL); setHistory([]);
    setResult(findBestMatch(rs)); setStage('results');
  }, []);

  const handleAnswer = useCallback((dim: number, val: number) => {
    setScores(p => { const n=[...p]; n[dim]+=val; return n; });
    setHistory(p => [...p, {dim,val}]);
    setCurrentQ(p => p+1);
  }, []);

  useEffect(() => {
    if (currentQ >= TOTAL && stage === 'quiz') {
      const r = findBestMatch(scores);
      setResult(r);
      setStage('results');
      clearProgress();
    } else if (currentQ > 0 && currentQ < TOTAL) {
      saveProgress(scores, currentQ, history);
    }
  }, [currentQ, stage, scores, history]);

  const handlePrev = useCallback(() => {
    if (currentQ <= 0) return;
    const last = history[history.length-1];
    if (last) {
      setScores(p => { const n=[...p]; n[last.dim]-=last.val; return n; });
      setHistory(p => p.slice(0,-1));
    }
    setCurrentQ(p => p-1);
  }, [currentQ, history]);

  const restart = useCallback(() => {
    setStage('intro'); setCurrentQ(0); setScores([0,0,0,0,0]); setHistory([]); setResult(null);
    clearProgress();
  }, []);

  return (
    <div className="min-h-screen bg-deep-900 relative overflow-hidden font-serif-cn">
      {/* Moving grid bg */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(232,227,216,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,227,216,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          animation: 'gridMove 60s linear infinite',
        }}
      />

      {/* CRT scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.08) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02))',
          backgroundSize: '100% 3px, 3px 100%',
          opacity: 0.5,
        }}
      />

      {/* Scanning line */}
      <div className="fixed left-0 right-0 h-[2px] pointer-events-none z-[1] opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,230,92,0.3), transparent)',
          animation: 'scanLine 8s linear infinite',
        }}
      />

      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(48px, 48px); }
        }
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {stage==='intro' && <Intro key="intro" onStart={startQuiz} onRandom={randomQuiz} onShowAll={showAll} onPrtsToggle={() => setPrtsActive(a => !a)} />}
          {stage==='quiz' && currentQ < TOTAL && <Quiz key="quiz" currentQ={currentQ} onAnswer={handleAnswer} onPrev={handlePrev} />}
          {stage==='results' && result && <Results key="results" result={result} onRestart={restart} />}
          {stage==='debug' && <DebugView key="debug" onBack={restart} />}
        </AnimatePresence>
      </div>

      {/* System footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-1.5 flex justify-between font-mono text-[9px] tracking-widest text-warm-dim/40 pointer-events-none select-none"
        style={{ borderTop: '1px solid rgba(232,227,216,0.05)' }}>
        <span onClick={() => setSysIdx(i => (i + 1) % SYS_MSGS.length)}
          className="cursor-pointer transition-colors duration-300 hover:text-warm-dim/70">{SYS_MSGS[sysIdx]}</span>
        <span>{stage === 'intro' ? 'IDLE' : stage === 'quiz' ? `Q${currentQ + 1}/${TOTAL}` : stage === 'debug' ? 'ARCHIVE' : 'RESULT'}</span>
        <span className="flex items-center gap-1" onClick={() => setSysIdx(i => (i + 7) % SYS_MSGS.length)}>
          <span className="w-1.5 h-1.5 rounded-full bg-lemon animate-pulse" />
          R.I. v2.0
        </span>
      </div>

      {/* PRTS Terminal Overlay */}
      {prtsActive && (
        <div className="fixed inset-0 z-50 bg-deep-900/95 font-mono text-xs p-8 overflow-auto"
          onClick={() => setPrtsActive(false)}
          style={{ color: '#4A8FE4' }}>
          <div className="max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-widest" style={{ color: '#4A8FE460' }}>PRTS TERMINAL v2.0.1</span>
              <button onClick={() => setPrtsActive(false)}
                className="text-warm-white/60 hover:text-warm-white text-xl leading-none cursor-pointer transition-colors">&times;</button>
            </div>
            <div className="border border-white/10 p-6 mb-4 bg-black/30">
              {[
                '> PRTS Core Online',
                '> 检测到博士的神经链接',
                '> 访问权限: ████████',
                '> 正在检索阿米娅的认知记录...',
                '> 凯尔希的访问日志已加密',
                '> WARNING: 检测到异常源石波动',
                '> 信号来源: ASSIMILATED UNIVERSE',
                '> 正在尝试连接 PRTS 深层链路...',
                '> 错误: 连接被 PRIESTESS 拒绝',
                '> [最后一次通信记录]:',
                '> "不准忘记我。"',
                '',
                `> 系统运行时间: ${Math.floor(Date.now() / 1000)}s`,
                `> 当前干员档案: ${OPERATORS.length} 份`,
                '> PRTS 协议 · 罗德岛战术终端',
                '> 点击任意处关闭 █',
              ].map((line, i, arr) => (
                <div key={i} className={`${line.startsWith('> "') ? 'italic' : ''}`}
                  style={{ opacity: 0.9 - i * 0.03, color: line.includes('错误') ? '#ff4444' : line.includes('WARNING') ? '#ffaa00' : line.includes('"') ? '#6688ff' : '#4A8FE4' }}>
                  {line}
                  {i === arr.length - 1 && <span className="prts-cursor" />}
                </div>
              ))}
            </div>
            <div className="text-[9px] tracking-widest text-center opacity-30">
              PRTS · 罗德岛战术指挥终端 · 加密等级: ████
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DebugView({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<Operator | null>(null);
  const cdn = import.meta.env.BASE_URL + 'images/avatar/';
  const ARCHIVE_MSGS = [
    '档案室 · 已解锁干员 16/16',
    '罗德岛人事档案 · 加密等级 B',
    '作战记录分析中... 请稍候',
    '凯尔希医生正在远程审查',
    'PRTS 档案库 · 调取中',
    '罗德岛战术指挥部 · 档案查阅',
    'S.W.E.E.P. 已记录本次访问',
    '可露希尔正在更新系统...',
    'PRTS: PRIESTESS.SYNC 信号微弱',
    '■■ 正在读取你的访问记录',
    '「在文明尽头，我们会再见面」',
    '源石语言解码: 进度 ████████',
    '警告: 检测到 THE FELLER 痕迹',
    'PRTS: 您有来自 ███ 的未读消息',
  ];
  const [archiveMsg] = useState(() => ARCHIVE_MSGS[Math.floor(Math.random() * ARCHIVE_MSGS.length)]);

  if (selected) {
    return <OperatorDetail op={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="min-h-screen px-4 py-12">
      <button onClick={onBack}
        className="mb-6 font-serif-cn text-xs tracking-[0.2em] text-warm-dim cursor-pointer hover:text-warm-muted bg-transparent border border-white/10 px-4 py-2">
        ← 返回
      </button>
      <h2 className="font-serif-en text-2xl text-white tracking-[0.08em] mb-1">全部干员</h2>
      <p className="font-mono text-[0.55rem] tracking-widest text-warm-dim/50 mb-6">{archiveMsg}</p>
      <div className="grid grid-cols-2 gap-3">
        {OPERATORS.map(op => (
          <button key={op.id}
            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 text-left cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-white/20"
            onClick={() => setSelected(op)}>
            <img src={cdn+op.avatar.replace('#','%23')+'.png'} alt={op.name} className="w-10 h-10 rounded-full object-cover"
              onError={e=>(e.target as HTMLElement).style.display='none'} />
            <div className="min-w-0">
              <div className="font-serif-cn text-sm text-warm-white truncate">{op.name}</div>
              <div className="font-serif-en text-[0.6rem] text-warm-dim truncate">{op.title}</div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function OperatorDetail({ op, onBack }: { op: Operator; onBack: () => void }) {
  const basePath = import.meta.env.BASE_URL;
  const avatarUrl = basePath + 'images/avatar/' + op.avatar.replace('#','%23') + '.png';
  const [heroFallback, setHeroFallback] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const p = (s: string) => basePath + 'images/' + s;
  const portraitUrl = op.portrait
    ? (op.portrait.startsWith('skin/') ? p(op.portrait.replace('#','%23')) : p('portrait/' + op.portrait))
    : heroFallback
      ? p('avatar/' + op.avatar.replace('#', '%23') + '.png')
      : p('skin/' + op.avatar.replace('#','%23') + '_2b.png');

  const detailMsgs = [
    '作战记录 #' + Math.floor(Math.random() * 9000 + 1000),
    '档案编号: ' + op.id.toUpperCase() + '-' + Math.floor(Math.random() * 99 + 1),
    '罗德岛人事部 · 内部流通',
    '凯尔希已签署本档案',
    'Endfield Sector · Echo Detected',
    'PRTS 解密等级: Sigma-' + Math.floor(Math.random() * 9 + 1),
    'PRTS: 该干员的源石数据与 ███ 存在关联',
    '「不准忘记我」—— 来自未知时间线的签名',
  ];
  const [footMsg] = useState(() => detailMsgs[Math.floor(Math.random() * detailMsgs.length)]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="min-h-screen px-0 py-0">
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '60vh' }}>
        <div className="absolute inset-0 z-0 flex items-start justify-center">
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}
          <img src={portraitUrl} alt={op.name}
            className="w-full h-full object-cover opacity-70"
            style={{ filter: 'brightness(0.55) saturate(1.1)', objectPosition: 'center 25%' }}
            onLoad={() => setImgLoaded(true)}
            onError={e => {
              if (!op.portrait && !heroFallback) setHeroFallback(true);
              else (e.target as HTMLImageElement).style.display = 'none';
            }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(13,15,17,0.3) 0%, rgba(13,15,17,0.6) 50%, #0D0F11 100%)'
          }} />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-end min-h-[60vh] px-6 pb-8 text-center">
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
            className="flex flex-col items-center">
            <img src={avatarUrl} alt={op.name}
              className="w-20 h-20 rounded-full object-cover border-2 mb-4"
              style={{ borderColor: op.color + '60' }}
              onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
            <h2 className="font-serif-en text-5xl font-normal tracking-[0.08em] text-white mb-1">{op.name}</h2>
            <p className="font-serif-cn text-sm tracking-[0.08em] text-warm-muted mb-3">{op.title}</p>
            <p className="font-serif-cn text-xs leading-relaxed text-warm-muted/70 max-w-xs mb-4">{op.desc}</p>
            <div className="font-serif-en text-xs tracking-widest px-3 py-1 mb-2"
              style={{ color: op.color, border: `1px solid ${op.color}40` }}>
              {op.clazz}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mx-auto px-6 pb-24">
        <button onClick={onBack}
          className="mb-6 font-serif-cn text-xs tracking-[0.2em] text-warm-dim cursor-pointer hover:text-warm-muted bg-transparent border border-white/10 px-4 py-2 transition-all duration-200">
          ← 返回档案室
        </button>

        {/* Persona */}
        <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.3}}>
          <div className="section-label">Persona</div>
          {op.persona.map((t,i) => <p key={i} className="persona-text">{t}</p>)}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {op.tags.map((t,i) => <span key={i} className="tag">{t}</span>)}
          </div>
        </motion.div>

        <div className="ornament">· · ·</div>

        {/* Epigraph */}
        {op.epigraph && (
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.45}}
            dangerouslySetInnerHTML={{ __html: `<div class="epigraph">${op.epigraph}</div>` }} />
        )}

        <div className="ornament">· · ·</div>

        {/* Soul */}
        <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.6}}>
          <div className="soul-card">
            <div className="soul-label">灵魂起源</div>
            <div className="soul-name">{op.name}</div>
            <div className="soul-name-cn">{op.title}</div>
            {op.soul.map((t,i) => (
              <p key={i} className="soul-text" dangerouslySetInnerHTML={{ __html: t }} />
            ))}
          </div>
        </motion.div>

        <div className="ornament">· · ·</div>

        {/* Radar - use operator's own coords */}
        <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.8}}>
          <RadarChart user={op.coords} operator={op.coords} color={op.color} opName={op.name} />
        </motion.div>

        {/* Footer easter egg */}
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
          className="font-mono text-[0.5rem] tracking-widest text-warm-dim/30 text-center mt-8">
          {footMsg}
        </motion.p>
      </div>
    </motion.div>
  );
}
