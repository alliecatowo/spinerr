import { describe, expect, it } from 'vitest';
import { clampLimit } from '../clamp-limit';

describe('clampLimit', () => {
  it('uses the fallback for missing or invalid values', () => {
    expect(clampLimit(null, 25)).toBe(25);
    expect(clampLimit('abc', 25)).toBe(25);
    expect(clampLimit('0', 25)).toBe(25);
    expect(clampLimit('-4', 25)).toBe(25);
  });

  it('passes through sane values', () => {
    expect(clampLimit('10', 25)).toBe(10);
  });

  it('caps oversized values', () => {
    expect(clampLimit('100000', 25)).toBe(50);
    expect(clampLimit('100000', 25, 200)).toBe(200);
  });
});
