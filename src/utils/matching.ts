import { OPERATORS } from '../data/operators';
import type { Operator } from '../data/types';

export interface MatchResult {
  op: Operator;
  compatible: number;
  userCoords: number[];
}

export function findBestMatch(scores: number[]): MatchResult {
  const user = scores.map(s => Math.round(s / 9 * 10));
  let bestOp: Operator = OPERATORS[0];
  let bestDist = Infinity;

  OPERATORS.forEach(op => {
    const dist = Math.sqrt(
      op.coords.reduce((acc, c, i) => acc + Math.pow(user[i] - c, 2), 0)
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestOp = op;
    }
  });

  const compat = Math.max(0, Math.round((1 - bestDist / Math.sqrt(500)) * 100));
  return { op: bestOp, compatible: compat, userCoords: user };
}
