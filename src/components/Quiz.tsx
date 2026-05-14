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

  // Keyboard shortcuts: 1-4
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md">
        {/* Dashboard-style Progress Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1.5 bg-slate-700/50 overflow-hidden rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #A89A20, #F5E65C)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span className="font-mono text-xs text-lemon min-w-[3.5rem] text-right tabular-nums tracking-wider">
            {currentQ + 1} / {QUESTIONS.length}
          </span>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="bg-card-bg backdrop-blur-sm border border-lemon-dim p-5 sm:p-6 mb-3">
              <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-200 mb-5">
                {question.text}
              </p>

              <div className="flex flex-col gap-2.5">
                {question.opts.map((opt, i) => (
                  <motion.button
                    key={`${currentQ}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(opt.dim, opt.val)}
                    className="flex items-start gap-3 w-full p-3.5 sm:p-4 bg-slate-700/30 border border-slate-700/40 text-sm text-left leading-relaxed cursor-pointer transition-all duration-200 hover:border-lemon/50 hover:bg-lemon/5 active:border-lemon"
                  >
                    <span className="font-mono text-xs font-bold text-lemon min-w-[1.2rem] pt-0.5 shrink-0">
                      {labels[i]}
                    </span>
                    <span className="text-slate-300">{opt.txt}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-2">
          {currentQ > 0 ? (
            <button
              onClick={onPrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-slate-700 text-slate-500 font-mono text-xs tracking-wider uppercase cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-slate-500 hover:text-white"
            >
              &#x2039; 上一题
            </button>
          ) : <div />}
          <span className="font-mono text-[0.6rem] text-slate-600 tracking-widest uppercase ml-auto">
            键盘 1-4 &#xB7; Backspace 返回
          </span>
        </div>
      </div>
    </div>
  );
}
