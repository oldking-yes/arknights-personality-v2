import { OPERATORS } from '../data/operators';
import type { Operator } from '../data/types';

export interface RankedMatch {
  op: Operator;
  compatible: number;
  distance: number;
}

export interface MatchResult {
  op: Operator;
  compatible: number;
  userCoords: number[];
  ranking: RankedMatch[];
}

const MAX_DIST = Math.sqrt(500);
const toCompat = (dist: number) => Math.max(0, Math.round((1 - dist / MAX_DIST) * 100));

function computeFromCoords(coords: number[]) {
  const matches = OPERATORS.map(op => {
    const dist = Math.sqrt(
      op.coords.reduce((acc, c, i) => acc + Math.pow(coords[i] - c, 2), 0)
    );
    return { op, dist };
  }).sort((a, b) => a.dist - b.dist);

  return matches;
}

export function buildResult(coords: number[]): MatchResult {
  const matches = computeFromCoords(coords);
  return {
    op: matches[0].op,
    compatible: toCompat(matches[0].dist),
    userCoords: coords,
    ranking: matches.map(m => ({
      op: m.op,
      compatible: toCompat(m.dist),
      distance: Math.round(m.dist * 100) / 100,
    })),
  };
}

/** Accept raw accumulated scores (0–30 per dim) and normalize to 0–10 coords */
export function findBestMatch(scores: number[]): MatchResult {
  const coords = scores.map(s => Math.round(s / 9 * 10));
  return buildResult(coords);
}

/** Accept pre‑normalized 0–10 coords (e.g. from deep‑link URL) */
export function findMatchFromCoords(coords: number[]): MatchResult {
  return buildResult(coords);
}
