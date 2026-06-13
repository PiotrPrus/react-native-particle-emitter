import type { EasingFunction } from './types';

/**
 * Worklet-safe easing curves, equivalents of the Compose `Easing` values the
 * original library accepts for `alphaEasing` / `scaleEasing`.
 */

/**
 * Solves a cubic bezier with control points (x1,y1) (x2,y2) for input x,
 * matching CSS cubic-bezier / Compose CubicBezierEasing semantics.
 *
 * NOTE: must be declared before the easings that capture it — the Reanimated
 * worklet transform turns function declarations into consts, so hoisting no
 * longer applies and a forward reference becomes a TDZ error at module load.
 */
export function cubicBezier(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  'worklet';
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Binary search for the bezier parameter t whose x-coordinate matches.
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 24; i++) {
    const omt = 1 - t;
    const bx = 3 * omt * omt * t * x1 + 3 * omt * t * t * x2 + t * t * t;
    if (Math.abs(bx - x) < 1e-5) break;
    if (bx < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  const omt = 1 - t;
  return 3 * omt * omt * t * y1 + 3 * omt * t * t * y2 + t * t * t;
}

export const linearEasing: EasingFunction = (t: number) => {
  'worklet';
  return t;
};

/** Compose `FastOutSlowInEasing` approximation (cubic-bezier 0.4, 0, 0.2, 1). */
export const fastOutSlowInEasing: EasingFunction = (t: number) => {
  'worklet';
  return cubicBezier(t, 0.4, 0.0, 0.2, 1.0);
};

/** Compose `LinearOutSlowInEasing` (cubic-bezier 0, 0, 0.2, 1). */
export const linearOutSlowInEasing: EasingFunction = (t: number) => {
  'worklet';
  return cubicBezier(t, 0.0, 0.0, 0.2, 1.0);
};

/** Compose `FastOutLinearInEasing` (cubic-bezier 0.4, 0, 1, 1). */
export const fastOutLinearInEasing: EasingFunction = (t: number) => {
  'worklet';
  return cubicBezier(t, 0.4, 0.0, 1.0, 1.0);
};

export const easeInCubic: EasingFunction = (t: number) => {
  'worklet';
  return t * t * t;
};

export const easeOutCubic: EasingFunction = (t: number) => {
  'worklet';
  const u = 1 - t;
  return 1 - u * u * u;
};
