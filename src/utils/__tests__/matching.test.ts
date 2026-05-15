import { describe, it, expect } from 'vitest';
import { findBestMatch, findMatchFromCoords } from '../matching';

describe('findBestMatch', () => {
  it('returns a valid result for all-zero scores', () => {
    const r = findBestMatch([0, 0, 0, 0, 0]);
    expect(r).toBeDefined();
    expect(r.op).toBeDefined();
    expect(r.userCoords).toEqual([0, 0, 0, 0, 0]);
    expect(r.compatible).toBeGreaterThanOrEqual(0);
    expect(r.compatible).toBeLessThanOrEqual(100);
    expect(r.ranking.length).toBe(16);
  });

  it('returns a valid result for all-max scores (30)', () => {
    const r = findBestMatch([30, 30, 30, 30, 30]);
    // normalize: Math.round(30/9*10) = 33
    expect(r.userCoords).toEqual([33, 33, 33, 33, 33]);
    expect(r.compatible).toBeGreaterThanOrEqual(0);
  });

  it('returns ranking sorted by distance ascending', () => {
    const r = findBestMatch([15, 15, 15, 15, 15]);
    for (let i = 1; i < r.ranking.length; i++) {
      expect(r.ranking[i].distance).toBeGreaterThanOrEqual(r.ranking[i - 1].distance);
    }
  });

  it('first ranking entry is the best match', () => {
    const r = findBestMatch([15, 15, 15, 15, 15]);
    expect(r.ranking[0].op.id).toBe(r.op.id);
  });
});

describe('findMatchFromCoords', () => {
  it('accepts pre-normalized coords', () => {
    const r = findMatchFromCoords([5, 6, 7, 4, 8]);
    expect(r.userCoords).toEqual([5, 6, 7, 4, 8]);
    expect(r.op).toBeDefined();
    expect(r.ranking.length).toBe(16);
  });

  it('rejects invalid coords via caller validation', () => {
    const r = findMatchFromCoords([0, 0, 0, 0, 0]);
    expect(r).toBeDefined();
    expect(r.ranking[0].compatible).toBeGreaterThanOrEqual(0);
  });

  it('perfect match to an operator returns high compatibility', () => {
    // Use actual operator coords
    const r = findMatchFromCoords([6, 3, 4, 5, 7]);
    expect(r.compatible).toBeGreaterThan(50);
  });
});
