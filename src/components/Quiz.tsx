import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from '../data/questions';
import type { Question } from '../data/types';

interface QuizProps {
  currentQ: number;
  onAnswer: (dim: number, val: number) => void;
  onPrev: () => void;
}

const labels = ['A', 'B', 'C', 'D'];

export default function Quiz({ currentQ, onAnswer, onPrev }: QuizProps) {
  const question: Question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const handleSelect = useCallback((dim: number, val: number) => {
    onAnswer(dim, val);
  }, [onAnswer]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = parseInt(e.key);
      if (k >= 1 && k <= 4 && question.opts[k - 1]) {
        handleSelect(question.opts[k - 1].dim, question.opts[k - 1].val);
      }
      if (e.key === 'Backspace' && currentQ > 0) onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [question, handleSelect, currentQ, onPrev]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <div className="w-full max-w-md">
        {/* header: section + progress */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-serif-en italic text-xs tracking-[0.15em] text-warm-dim">TACTICAL ASSESSMENT</span>
          <span className="font-serif-en text-xs tracking-[0.1em] text-warm-muted">
            {String(currentQ + 1).padStart(2, '0')} / {String(QUESTIONS.length).padStart(2, '0')}
          </span>
        </div>

        {/* Minimal progress bar */}
        <div className="h-px bg-white/10 mb-8 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-1 font-mono text-[0.55rem] tracking-[0.2em] text-warm-dim/50">
              ⌥ #{String(currentQ + 1).padStart(2, '0')}
            </div>
            <p className="text-lg font-medium leading-relaxed text-warm-white mb-8">
              {question.text}
            </p>

            <div className="flex flex-col gap-3">
              {question.opts.map((opt, i) => (
                <motion.button
                  key={`${currentQ}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(opt.dim, opt.val)}
                  className="flex items-start gap-3 w-full p-4 bg-white/5 border border-white/10 text-sm text-left leading-relaxed cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12]"
                >
                  <span className="font-serif-en italic text-sm text-warm-dim min-w-[1.2rem] shrink-0">
                    {labels[i]}
                  </span>
                  <span className="text-warm-white/90">{opt.txt}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          {currentQ > 0 ? (
            <button
              onClick={onPrev}
              className="px-4 py-2 bg-transparent border border-white/10 text-warm-dim font-serif-cn text-xs tracking-[0.2em] cursor-pointer transition-all duration-200 hover:bg-white/[0.05] hover:text-warm-muted hover:border-white/20"
            >
              ← 上一题
            </button>
          ) : <div />}
          <span className="font-mono text-[0.5rem] tracking-[0.2em] text-warm-dim/40">
            [1–4] SELECT · [BKSP] RETURN
          </span>
        </div>
      </div>
    </div>
  );
}
