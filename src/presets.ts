import type { SkFont } from '@shopify/react-native-skia';
import type { CanvasEmitterConfig, Vec2 } from './types';
import { easeOutCubic } from './easing';

/**
 * Ready-made configs ported from the Compose sample app
 * (GlowSample, ConfettiSample, EmojiRainSample, RingEmitterSample).
 */

/** Glowing additive particles, like the Compose Glow sample. */
export function glowPreset(center: Vec2): CanvasEmitterConfig {
  return {
    particlePerSecond: 50,
    emitterCenter: center,
    particleShapes: [{ type: 'circle' }],
    lifespanRange: [800, 1200],
    fadeOutTime: [600, 1000],
    scaleTime: [800, 1200],
    colors: ['#00ffff', '#ff00ff', '#ffff00'],
    particleSizes: [
      { width: 8, height: 8 },
      { width: 12, height: 12 },
    ],
    spread: [-90, 90],
    blendMode: 'screen',
    initialForce: [50, 150],
  };
}

/** Confetti burst falling under gravity. */
export function confettiPreset(center: Vec2): CanvasEmitterConfig {
  return {
    particlePerSecond: 120,
    emitterCenter: center,
    particleShapes: [{ type: 'circle' }],
    lifespanRange: [1800, 2600],
    fadeOutTime: [1800, 2600],
    scaleTime: [200, 400],
    colors: ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb'],
    particleSizes: [
      { width: 6, height: 6 },
      { width: 10, height: 10 },
    ],
    spread: [-60, 60],
    initialForce: [200, 420],
    gravityStrength: 350,
    gravityAngle: 0,
    startScaleRange: [1, 1],
    targetScaleRange: [1, 1],
    scaleEasing: easeOutCubic,
  };
}

/** Fullscreen emoji rain using the text shape. Needs an emoji-capable font. */
export function emojiRainPreset(
  width: number,
  font: SkFont,
  emoji = '🎉'
): CanvasEmitterConfig {
  return {
    particlePerSecond: 12,
    emitterCenter: { x: width / 2, y: -40 },
    startRegionShape: 'h-line',
    startRegionSize: { width, height: 0 },
    particleShapes: [{ type: 'text', text: emoji, font }],
    lifespanRange: [3000, 5000],
    fadeOutTime: [4500, 5000],
    scaleTime: [300, 600],
    colors: ['#ffffff'],
    particleSizes: [{ width: 24, height: 24 }],
    spread: [170, 190],
    initialForce: [40, 90],
    gravityStrength: 60,
    gravityAngle: 0,
    startScaleRange: [1, 1],
    targetScaleRange: [1, 1],
  };
}

/** Ring emitter with a clean interior (hideInStartRegion). */
export function ringPreset(center: Vec2, diameter = 180): CanvasEmitterConfig {
  return {
    particlePerSecond: 80,
    emitterCenter: center,
    startRegionShape: 'oval',
    startRegionSize: { width: diameter, height: diameter },
    particleShapes: [{ type: 'circle' }],
    lifespanRange: [600, 1200],
    fadeOutTime: [500, 1000],
    scaleTime: [600, 1200],
    colors: ['#80d8ff', '#82b1ff', '#b388ff'],
    particleSizes: [{ width: 6, height: 6 }],
    spread: [0, 360],
    blendMode: 'plus',
    initialForce: [30, 80],
    hideInStartRegion: true,
  };
}
