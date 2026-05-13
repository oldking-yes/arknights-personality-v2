const KEYS = {
  scores: 'ak2_scores',
  current: 'ak2_current',
  history: 'ak2_history',
} as const;

export function saveProgress(scores: number[], currentQ: number, history: number[][]) {
  try {
    localStorage.setItem(KEYS.scores, JSON.stringify(scores));
    localStorage.setItem(KEYS.current, String(currentQ));
    localStorage.setItem(KEYS.history, JSON.stringify(history));
  } catch {}
}

export function loadProgress(): { scores: number[]; currentQ: number; history: number[][] } | null {
  try {
    const cur = localStorage.getItem(KEYS.current);
    if (cur === null) return null;
    const c = parseInt(cur);
    if (isNaN(c) || c <= 0 || c >= 15) return null;
    return {
      scores: JSON.parse(localStorage.getItem(KEYS.scores) || '[0,0,0,0,0]'),
      currentQ: c,
      history: JSON.parse(localStorage.getItem(KEYS.history) || '[]'),
    };
  } catch { return null; }
}

export function clearProgress() {
  try { Object.values(KEYS).forEach(k => localStorage.removeItem(k)); } catch {}
}
