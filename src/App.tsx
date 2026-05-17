import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import ErrorBoundary from './components/ErrorBoundary';
import RadarChart from './components/RadarChart';
import { QUESTIONS } from './data/questions';
import { findBestMatch, findMatchFromCoords } from './utils/matching';
import { saveProgress, loadProgress, clearProgress } from './utils/storage';
import type { Stage, AnswerRecord, Operator } from './data/types';
import { OPERATORS } from './data/operators';

const Quiz = lazy(() => import('./components/Quiz'));
const Results = lazy(() => import('./components/Results'));

const LoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6"
    style={{ background: '#0D0F11' }}>
    <div className="skeleton w-48 h-4" />
    <div className="skeleton w-72 h-10" />
    <div className="skeleton w-64 h-4" />
    <div className="flex flex-col gap-3 w-full max-w-sm mt-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton w-full h-14" />
      ))}
    </div>
  </div>
);

const TOTAL = QUESTIONS.length;

type AppStage = Stage | 'debug';

export default function App() {
  const [stage, setStage] = useState<AppStage>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0, 0]);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [result, setResult] = useState<ReturnType<typeof findBestMatch> | null>(null);
  const browseIdx = useRef(0);
  const [sysIdx, setSysIdx] = useState(0);
  const keyBuf = useRef('');
  const [prtsActive, setPrtsActive] = useState(false);
  const [challengeCoords, setChallengeCoords] = useState<number[] | null>(null);
  const [debugOp, setDebugOp] = useState<Operator | null>(null);
  const [corruptionLevel, setCorruptionLevel] = useState(0);
  const ansTimes = useRef<number[]>([]);
  const ansDims = useRef<number[]>([]);
  const [forcePriestess, setForcePriestess] = useState(false);
  const [dimWarning, setDimWarning] = useState(false);
  const [idleCrystal, setIdleCrystal] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Idle crystal: 60s inactivity during quiz
  useEffect(() => {
    if (stage === 'quiz') {
      const reset = () => {
        setIdleCrystal(false);
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => setIdleCrystal(true), 60000);
      };
      reset();
      window.addEventListener('click', reset);
      window.addEventListener('keydown', reset);
      return () => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        window.removeEventListener('click', reset);
        window.removeEventListener('keydown', reset);
      };
    } else {
      setIdleCrystal(false);
    }
  }, [stage, currentQ]);

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

  // Deep linking: ?c=5,9,6,5,7&challenge=1&u2=3,5,7,4,6
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const coordsStr = params.get('c');
    const u2Str = params.get('u2');
    const challenge = params.get('challenge');
    if (coordsStr) {
      const coords = coordsStr.split(',').map(Number);
      if (coords.length === 5 && coords.every(n => !isNaN(n) && n >= 0 && n <= 10)) {
        const r = findMatchFromCoords(coords);
        setResult(r);
        setStage('results');
        if (challenge === '1' && u2Str) {
          const u2 = u2Str.split(',').map(Number);
          if (u2.length === 5 && u2.every(n => !isNaN(n) && n >= 0 && n <= 10)) {
            setChallengeCoords(u2);
          } else {
            setChallengeCoords(coords);
          }
        }
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // PRTS terminal & keyboard easter eggs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      keyBuf.current = (keyBuf.current + e.key).slice(-12);
      const buf = keyBuf.current.toLowerCase();
      if (buf.includes('prts')) {
        if (stage !== 'quiz') { setPrtsActive(a => !a); }
        keyBuf.current = '';
      }
      if (buf.includes('theresa')) {
        console.log('%c📁 PRTS: 该档案已被加密。', 'color:#4A8FE4;font-size:12px');
        keyBuf.current = '';
      }
      if (buf.includes('priestess')) {
        console.log('%c👁 PRTS: 她在看你。', 'color:#6688ff;font-size:12px');
        keyBuf.current = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const startQuiz = useCallback(() => {
    setCurrentQ(0); setScores([0,0,0,0,0]); setHistory([]); setResult(null); setStage('quiz');
    setCorruptionLevel(0); setForcePriestess(false); setDimWarning(false); setIdleCrystal(false);
    ansTimes.current = []; ansDims.current = [];
  }, []);

  const showAll = useCallback(() => {
    setStage('debug');
  }, []);

  const randomQuiz = useCallback(() => {
    const rs = Array.from({length:5}, () => Math.floor(Math.random()*4)*3 + Math.floor(Math.random()*3));
    setScores(rs); setCurrentQ(TOTAL); setHistory([]);
    setResult(findBestMatch(rs)); setStage('results');
  }, []);

  const browseNext = useCallback(() => {
    browseIdx.current = (browseIdx.current + 1) % OPERATORS.length;
    setResult(findMatchFromCoords(OPERATORS[browseIdx.current].coords));
  }, []);

  const browsePrev = useCallback(() => {
    browseIdx.current = (browseIdx.current - 1 + OPERATORS.length) % OPERATORS.length;
    setResult(findMatchFromCoords(OPERATORS[browseIdx.current].coords));
  }, []);

  const handleAnswer = useCallback((dim: number, val: number) => {
    const now = Date.now();
    ansTimes.current.push(now);
    ansDims.current.push(dim);
    // Dim warning: 5 consecutive same dimension
    const recentDims = ansDims.current.slice(-5);
    if (recentDims.length >= 5 && recentDims.every(d => d === dim)) {
      setDimWarning(true);
    } else {
      setDimWarning(false);
    }
    // Speed detection: check last 6 answers within 1s each
    const recent = ansTimes.current.slice(-6);
    if (recent.length >= 5) {
      const gaps = recent.slice(1).map((t, i) => t - recent[i]);
      const fastCount = gaps.filter(g => g < 1000).length;
      if (fastCount >= 4) {
        setCorruptionLevel(l => Math.min(3, l + 1));
        if (fastCount >= 5) setForcePriestess(true);
      } else {
        // Decay corruption if user slows down
        setCorruptionLevel(l => Math.max(0, l - 0.3));
      }
    }
    setScores(p => { const n=[...p]; n[dim]+=val; return n; });
    setHistory(p => [...p, {dim,val}]);
    setCurrentQ(p => p+1);
  }, []);

  useEffect(() => {
    if (currentQ >= TOTAL && stage === 'quiz') {
      let r: ReturnType<typeof findBestMatch>;
      if (forcePriestess) {
        const priestessOp = OPERATORS.find(o => o.id === 'priestess');
        const fakeCoords = [6,8,5,6,7];
        const fakeResult = findMatchFromCoords(fakeCoords);
        r = priestessOp ? { ...fakeResult, op: priestessOp } : findBestMatch(scores);
      } else {
        r = findBestMatch(scores);
      }
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
        @keyframes crystalGrow {
          0% { opacity: 0; }
          20% { opacity: 0.02; }
          100% { opacity: 0.08; }
        }
      `}</style>

      {idleCrystal && (
        <div className="fixed inset-0 pointer-events-none z-[100]"
          style={{
            background: 'repeating-linear-gradient(45deg, rgba(245,230,92,0.04) 0px, transparent 3px, rgba(245,230,92,0.04) 6px), repeating-linear-gradient(-30deg, rgba(245,230,92,0.02) 0px, transparent 5px, rgba(245,230,92,0.02) 10px)',
            animation: 'crystalGrow 3s ease-in forwards',
          }} />
      )}

      <ErrorBoundary>
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {stage==='intro' && <Intro key="intro" onStart={startQuiz} onRandom={randomQuiz} onShowAll={showAll} onPrtsToggle={() => setPrtsActive(a => !a)} />}
            {stage==='quiz' && currentQ < TOTAL && (
              <Suspense fallback={<LoadingSkeleton />}>
                <Quiz key="quiz" currentQ={currentQ} onAnswer={handleAnswer} onPrev={handlePrev} corruptionLevel={corruptionLevel} dimWarning={dimWarning} />
              </Suspense>
            )}
            {stage==='results' && result && (
              <Suspense fallback={<LoadingSkeleton />}>
                <Results key="results" result={result} onRestart={restart}
                  onViewOp={(opId) => { setDebugOp(OPERATORS.find(o => o.id === opId) || null); setStage('debug'); }}
                  challengeCoords={challengeCoords}
                  onPrevOp={browsePrev} onNextOp={browseNext}
                />
              </Suspense>
            )}
            {stage==='debug' && <DebugView key="debug" onBack={restart} initialOp={debugOp} onCloseOp={() => setDebugOp(null)} />}
          </AnimatePresence>
        </div>
      </ErrorBoundary>

      {/* System footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-1.5 flex justify-between font-mono text-[9px] tracking-widest text-warm-dim/40 pointer-events-none select-none"
        style={{ borderTop: '1px solid rgba(232,227,216,0.05)' }}>
        <span onClick={() => setSysIdx(i => (i + 1) % SYS_MSGS.length)}
          className="cursor-pointer transition-colors duration-300 hover:text-warm-dim/70">{SYS_MSGS[sysIdx]}</span>
        <span>{stage === 'intro' ? 'IDLE' : stage === 'quiz' ? `Q${currentQ + 1}/${TOTAL}` : stage === 'debug' ? 'ARCHIVE' : 'RESULT'}</span>
        <span className="flex items-center gap-1" onClick={() => setSysIdx(i => (i + 7) % SYS_MSGS.length)}>
          <span className="w-1.5 h-1.5 rounded-full bg-lemon animate-pulse" />
          PRTS v3.0
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

function DebugView({ onBack, initialOp, onCloseOp }: { onBack: () => void; initialOp?: Operator | null; onCloseOp?: () => void }) {
  const [selected, setSelected] = useState<Operator | null>(initialOp || null);
  const cdn = import.meta.env.BASE_URL + 'images/avatar/';
  function imgUrl(avatar: string) {
    if (avatar.startsWith('enemy/')) return cdn.replace('avatar/','') + avatar;
    return cdn + avatar.replace('#','%23') + '.png';
  }
  const ARCHIVE_MSGS = [
    '档案室 · 已解锁干员 ' + OPERATORS.length + '/' + OPERATORS.length + '',
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
    return <OperatorDetail op={selected} onBack={() => { setSelected(null); onCloseOp?.(); }} />;
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
            <img src={imgUrl(op.avatar)} alt={op.name} className="w-10 h-10 rounded-full object-cover"
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
  const isEnemy = op.avatar.startsWith('enemy/');
  const ext = '.png';
  const avatarUrl = !isEnemy ? basePath + 'images/avatar/' + op.avatar.replace('#','%23') + ext : '';
  const [heroFallback, setHeroFallback] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const p = (s: string) => basePath + 'images/' + s;
  const portraitUrl = op.portrait
    ? (op.portrait.startsWith('skin/') || op.portrait.startsWith('enemy/') ? p(op.portrait.replace('#','%23')) : p('portrait/' + op.portrait))
    : isEnemy
      ? p(op.avatar.replace('#','%23'))
      : heroFallback
        ? p('avatar/' + op.avatar.replace('#', '%23') + ext)
        : p('portrait/' + op.avatar.replace('#','%23') + ext);

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
  const [amiyaDark, setAmiyaDark] = useState(false);
  const [corruptLvl, setCorruptLvl] = useState(0);
  const [shakeLvl, setShakeLvl] = useState(0);
  const amiyaClicks = useRef(0);
  const handleAmiyaClick = () => {
    if (op.id !== 'amiya') return;
    amiyaClicks.current += 1;
    if (amiyaDark) {
      // After full corruption: only shake, no text change
      setShakeLvl(1);
      setTimeout(() => setShakeLvl(0), 500);
      return;
    }
    if (amiyaClicks.current <= 3) {
      setShakeLvl(amiyaClicks.current);
      setCorruptLvl(0);
      setTimeout(() => setShakeLvl(0), 500);
    } else {
      const lvl = Math.min(5, amiyaClicks.current - 3);
      setCorruptLvl(lvl);
      if (lvl >= 5) setAmiyaDark(true);
    }
  };
  // Garbled text
  const corrupt = (text: string, lvl: number) => {
    if (lvl === 0) return text;
    return text.split('').map(c => Math.random() < lvl * 0.12 ? '█' : c).join('');
  };
  // Progressive corruption story texts
  const corruptStories = [
    op.desc,
    '检测到异常源石信号。数据库中出现了一段不属于当前人格记录的编码片段。',
    '█段来自黑暗时代的信█正在解压……萨卡兹的古老记忆开始渗透进当前人格层。',
    '██冠的碎片在意识深处闪烁。无数的声音在耳边低语——它们叫她"魔王"。',
    '████的记忆逐渐清晰。那个被她拒绝的名字——"魔王"——在源石数据层反复回响。她曾以为自己可以只是一个名叫阿米娅的少女。',
    '黑冠选择了她。从特蕾西娅手中坠落的那顶冠冕，从未真正离开。在萨卡兹的古老预言中，魔王不是摧毁者——是背负者。背负所有萨卡兹的灵魂、记忆与诅咒，走向一个没有人见过的终点。阿米娅没有选择成为魔王。但冠冕从不在意选择。它只在意——你是否愿意背负。'
  ];
  const corruptNote = corruptStories[Math.min(corruptLvl, 5)];
  // Progressive corruption for persona, epigraph, soul, tags
  const corruptPersona = [
    op.persona,
    [op.persona[0], op.persona[1], '█股不属于你的记忆正在渗入……'],
    [op.persona[0], '█识深处有什么在裂开。那不是你的情绪——是来█黑冠的回响。', '█股不属于你的记忆正在渗入……'],
    ['那颗温柔的心正在被████侵蚀。', '██识深处有什么在裂开。那不是你的情绪——是来自黑冠的回响。', '所有的声音都在重复同一个词：魔王。魔王。魔王。'],
    ['那颗温柔的心正在被████侵蚀。你早已不是那个在切尔诺伯格做出决定的少女了。', '██识深处——那里只剩下一顶黑冠的轮廓。', '所有的声音都在重复同一个词：魔王。她开始相信了。'],
    ['她的温柔曾经是真的。但温柔无法背负萨卡兹的千年诅咒。阿米娅将那份温柔沉进了源石数据的最底层——因为魔王不需要被理解。', '她不再试图分辨那些情绪哪些是自己的。特蕾西娅、W、凯尔希、博士——所有人的声音都变成了冠冕的一部分。她接受了它们。', '切尔诺伯格废墟上那个决定的重量，和黑冠相比轻如尘埃。现在的她明白了一件事：魔王不需要做正确的选择——只需要做必要的选择。']
  ];
  const corruptEpigraph = [
    op.epigraph,
    '"█…█…█…" — 信号干扰中',
    '"████████" — 无法解析',
    '"不准忘记我。" — 一段不属于阿米娅的记忆突然浮现',
    '"不准忘记我。" — 这句话写在冠冕内壁。不是对她说的。是对博士。',
    '"她曾想成为一束光。但黑暗需要另一片黑暗来消融。魔王不需要照亮什么——她只需要走下去。" — 萨卡兹箴言·第十三节'
  ];
  const corruptSoul = [
    op.soul,
    op.soul,
    [op.soul[0], op.soul[1], '██的一条数据正在被覆写……', op.soul[3]],
    ['阿米娅的双手戴着黑白两枚戒指。黑色那枚正在融化——与她的手指融为一体。', '在切尔诺伯格的废墟上，那个决定不再属于她自己。黑冠替她做了选择。', '███的记忆——那些不属于泰拉的、来自前文明的碎片——开始与她的意识融合。她看见了博士看见过的东西。', '冠冕在低语。它说：你终于愿意听了。'],
    ['■■的双手已经不是孩童的手了。黑色戒指已经消失——它成了她的一部分。白色戒指还挂在指尖，随时可能滑落。', '切尔诺伯格已经是很久以前的事了。现在的废墟在她的意识深处——每一个萨卡兹死后的记忆都堆积在那里。凯尔希说你做得对——但凯尔希不知道黑冠里有多少个声音在同时说「你错了」。', '她看见了博士看见过的东西。那些被遗忘的前文明、源石的真相、普瑞赛斯的微笑。黑冠不只是萨卡兹的诅咒——它是通往源石核心的钥匙。', '她不再抵抗了。'],
    ['她是 AMIYA，是那个愿意背负的人。她不再是那个在切尔诺伯格颤抖着做出决定的少女。黑冠选择了她，而她选择了接受。不是因为这份力量无法拒绝——是因为她终于明白，有些重量必须有人来背。如果注定是她，那就她吧。']
  ];
  const corruptTags = [
    op.tags,
    ['温柔的坚定','魔王','██侵入','不肯放弃'],
    ['坚定的██','魔王','记忆侵入','意识的裂█'],
    ['██','魔王','记忆覆写','黑冠共鸣'],
    ['██','黑冠的继承者','人格覆写中','源石数据污染'],
    ['萨卡兹之王','背负者','冠冕的意志','永恒的归宿']
  ];
  const pIdx = shakeLvl > 0 ? 0 : Math.min(corruptLvl, 5);
  const showPersona = corruptPersona[pIdx];
  const showEpigraph = corruptEpigraph[pIdx];
  const showSoul = corruptSoul[pIdx];
  const showTags = corruptTags[pIdx];
  const aUrl = amiyaDark ? basePath + 'images/avatar/amiya_dark.png' : avatarUrl;
  const pUrl = amiyaDark ? p('portrait/amiya_dark.png') : portraitUrl;
  const darkTitle = amiyaDark ? '侵蚀率: ' + (60 + corruptLvl * 7) + '% · 意识残留: ' + (40 - corruptLvl * 7) + '%' : op.title;
  const darkCls = amiyaDark ? 'glitch-active' : '';

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`min-h-screen px-0 py-0 ${darkCls}`}>
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '60vh' }}>
        <div className="absolute inset-0 z-0 flex items-start justify-center">
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}
          <img src={pUrl} alt={op.name}
            className="w-full h-full object-cover opacity-70"
            style={{ filter: amiyaDark ? 'brightness(0.3) saturate(0.2) hue-rotate(300deg)' : 'brightness(0.55) saturate(1.1)', objectPosition: 'center 25%' }}
            onLoad={() => setImgLoaded(true)}
            onError={e => {
              if (!op.portrait && !heroFallback) setHeroFallback(true);
              else (e.target as HTMLImageElement).style.display = 'none';
            }} />
          <div className="absolute inset-0" style={{
            background: amiyaDark ? 'linear-gradient(to bottom, rgba(217,119,6,0.15) 0%, rgba(13,15,17,0.85) 50%, #0D0F11 100%)' : 'linear-gradient(to bottom, rgba(13,15,17,0.3) 0%, rgba(13,15,17,0.6) 50%, #0D0F11 100%)'
          }} />
          {amiyaDark && <div className="scanline-overlay" />}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-end min-h-[60vh] px-6 pb-8 text-center">
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
            className="flex flex-col items-center">
            <img src={aUrl} alt={op.name}
              className={`w-20 h-20 rounded-full object-cover border-2 mb-4 cursor-pointer ${amiyaDark ? 'corrupt-glow' : ''}`}
              style={{ borderColor: amiyaDark ? '#d97706' : op.color + '60', animation: amiyaDark ? 'jitter 0.15s ease-in-out infinite' : 'none' }}
              onClick={handleAmiyaClick}
              onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
            <h2 className={`font-serif-en text-5xl font-normal tracking-[0.08em] mb-1 ${darkCls} ${shakeLvl > 0 ? 'shake-subtle' : ''} ${corruptLvl > 0 && corruptLvl < 5 ? 'glitch-active' : ''}`}
              style={{cursor: op.id === 'amiya' ? 'pointer' : 'default', color: amiyaDark ? '#d97706' : '#ffffff'}}
              onClick={handleAmiyaClick}>{amiyaDark ? '■■ ' + corrupt('阿米娅', corruptLvl) + ' · 魔王化 ■■' : op.name}</h2>
            <p className={`font-serif-cn text-sm tracking-[0.08em] mb-3`} style={{color: '#b8b0a0'}}>
              {amiyaDark ? darkTitle : op.title}</p>
            <p className="font-serif-cn text-xs leading-relaxed max-w-xs mb-4" style={{color: amiyaDark ? '#f59e0b' : '#b8b0a0'}}>
              {shakeLvl > 0 ? '' : (corruptLvl >= 5 ? corruptNote : corrupt(corruptNote, corruptLvl))}</p>
            <div className={`font-serif-en text-xs tracking-widest px-3 py-1 mb-2 ${amiyaDark ? 'corrupt-border' : ''}`}
              style={{ color: amiyaDark ? '#d97706' : op.color, border: `1px solid ${amiyaDark ? '#d97706' : op.color + '40'}` }}>
              {amiyaDark ? 'CORRUPTED' : op.clazz}
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
          <div className="section-label" style={{color: amiyaDark ? '#d97706' : undefined}}>
            {amiyaDark ? '⬡ 人格覆写中 ⬡' : 'Persona'}
          </div>
          {showPersona?.map((t,i) => <p key={i} className="persona-text" style={{color: amiyaDark ? '#d97706' : undefined}}>{t}</p>)}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {showTags?.map((t,i) => <span key={i} className="tag" style={{borderColor: amiyaDark ? 'rgba(217,119,6,0.3)' : undefined, color: amiyaDark ? '#d97706' : undefined}}>{t}</span>)}
          </div>
        </motion.div>

        <div className="ornament">· · ·</div>

        {/* Epigraph */}
        {op.epigraph && (
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.45}}
            dangerouslySetInnerHTML={{ __html: `<div class="epigraph" style="${amiyaDark ? 'border-color:rgba(217,119,6,0.3);color:#d97706' : ''}">${showEpigraph}</div>` }} />
        )}

        <div className="ornament">· · ·</div>

        {/* Soul */}
        <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.6}}>
          <div className="soul-card" style={amiyaDark ? {borderColor: 'rgba(217,119,6,0.2)'} : {}}>
            <div className="soul-label" style={{color: amiyaDark ? '#d97706' : undefined}}>
              {amiyaDark ? '⬡ 萨卡兹记忆层 ⬡' : '灵魂起源'}
            </div>
            <div className="soul-name">{amiyaDark ? '■■ 阿米娅 · 魔王化 ■■' : op.name}</div>
            <div className="soul-name-cn">{amiyaDark ? '侵蚀率: ' + (60 + corruptLvl * 7) + '%' : op.title}</div>
            {showSoul?.map((t,i) => (
              <p key={i} className="soul-text" style={{color: amiyaDark ? '#d97706' : undefined}} dangerouslySetInnerHTML={{ __html: t }} />
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
