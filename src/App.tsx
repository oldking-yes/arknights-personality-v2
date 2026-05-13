import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { QUESTIONS } from './data/questions';
import { findBestMatch } from './utils/matching';
import { saveProgress, loadProgress, clearProgress } from './utils/storage';
import type { Stage, AnswerRecord } from './data/types';


const TOTAL = QUESTIONS.length;

export default function App() {
  const [stage, setStage] = useState<Stage>('intro');
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

  // When currentQ reaches end, compute result
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
    <div className="min-h-screen bg-[#07090e] relative overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(245,230,92,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,92,.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)' }}
      />

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({length:20}).map((_,i) => (
          <div key={i} className="absolute w-[2px] h-[2px] bg-lemon/20 rounded-full"
            style={{
              left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
              animation:`pulse ${2+Math.random()*3}s ease-in-out infinite`,
              animationDelay:`${Math.random()*3}s`
            }}
          />
        ))}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:0}50%{opacity:1}}`}</style>

      <div className="relative z-10 w-full max-w-lg mx-auto px-3">
        <AnimatePresence mode="wait">
          {stage==='intro' && <Intro key="intro" onStart={startQuiz} onRandom={randomQuiz} />}
          {stage==='quiz' && <Quiz key="quiz" currentQ={currentQ} onAnswer={handleAnswer} onPrev={handlePrev} />}
          {stage==='results' && result && <Results key="results" result={result} onRestart={restart} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
