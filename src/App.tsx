import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { QUESTIONS } from './data/questions';
import { findBestMatch } from './utils/matching';
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
          {stage==='intro' && <Intro key="intro" onStart={startQuiz} onRandom={randomQuiz} onShowAll={showAll} />}
          {stage==='quiz' && currentQ < TOTAL && <Quiz key="quiz" currentQ={currentQ} onAnswer={handleAnswer} onPrev={handlePrev} />}
          {stage==='results' && result && <Results key="results" result={result} onRestart={restart} />}
          {stage==='debug' && <DebugView key="debug" onBack={restart} />}
        </AnimatePresence>
      </div>

      {/* System footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-1.5 flex justify-between font-mono text-[9px] tracking-widest text-warm-dim/40 pointer-events-none"
        style={{ borderTop: '1px solid rgba(232,227,216,0.05)' }}>
        <span>SYS: ACTIVE</span>
        <span>{stage === 'intro' ? 'IDLE' : stage === 'quiz' ? `Q${currentQ + 1}/${TOTAL}` : 'RESULT'}</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-lemon animate-pulse" />
          R.I. v2.0
        </span>
      </div>
    </div>
  );
}

function DebugView({ onBack }: { onBack: () => void }) {
  const [selected] = useState<Operator | null>(null);
  const cdn = 'https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/avatar/';

  if (selected) return null;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="min-h-screen px-4 py-12">
      <button onClick={onBack}
        className="mb-6 font-serif-cn text-xs tracking-[0.2em] text-warm-dim cursor-pointer hover:text-warm-muted bg-transparent border border-white/10 px-4 py-2">
        ← 返回
      </button>
      <h2 className="font-serif-en text-2xl text-white tracking-[0.08em] mb-2">全部干员</h2>
      <p className="font-serif-cn text-xs text-warm-dim mb-6">点击查看结果页</p>
      <div className="grid grid-cols-2 gap-3">
        {OPERATORS.map(op => (
          <button key={op.id}
            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 text-left cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-white/20"
            onClick={() => window.location.href = `/?debug=${op.id}`}>
            <img src={cdn+op.avatar+'.png'} alt="" className="w-10 h-10 rounded-full object-cover"
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
