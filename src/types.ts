import type { SkFont, SkImage, SkPath } from '@shopify/react-native-skia';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Inclusive [min, max] range. A single value can be expressed as [v, v]. */
export type Range = [number, number];

/**
 * Shape of the emission region. Particles spawn on the circumference/outline
 * of the region (or at the point itself for `point`).
 */
export type EmitterRegionShape = 'point' | 'oval' | 'rect' | 'h-line' | 'v-line';

/**
 * Defines how particles behave when they reach the canvas boundary.
 * - `none`  — particles pass through edges freely (default)
 * - `bounce`— particles reflect off edges; `damping` is the fraction of
 *             velocity retained per bounce (0–1, default 0.7)
 * - `stick` — particles stop at the edge for the rest of their lifespan
 * - `wrap`  — particles exiting one edge reappear on the opposite side
 */
export type EdgeBehavior =
  | { type: 'none' }
  | { type: 'bounce'; damping?: number }
  | { type: 'stick' }
  | { type: 'wrap' };

/**
 * Visual shape of a particle.
 * - `circle` — filled circle using the particle color
 * - `path`   — a custom SkPath filled with the particle color
 * - `image`  — an SkImage, tinted with the particle color when `tint` is true
 * - `text`   — text or emoji drawn with the given SkFont
 */
export type ParticleShape =
  | { type: 'circle' }
  | { type: 'path'; path: SkPath }
  | { type: 'image'; image: SkImage; tint?: boolean }
  | { type: 'text'; text: string; font: SkFont };

/**
 * Easing curve mapping normalized time [0,1] to progress [0,1].
 * MUST be a worklet (declare `'worklet';` as the first statement) because it
 * runs on the UI thread. The easings exported from `easing.ts` already are.
 */
export type EasingFunction = (t: number) => number;

/** Skia blend mode names supported per-particle. */
export type BlendModeName =
  | 'clear' | 'src' | 'dst' | 'srcOver' | 'dstOver' | 'srcIn' | 'dstIn'
  | 'srcOut' | 'dstOut' | 'srcATop' | 'dstATop' | 'xor' | 'plus' | 'modulate'
  | 'screen' | 'overlay' | 'darken' | 'lighten' | 'colorDodge' | 'colorBurn'
  | 'hardLight' | 'softLight' | 'difference' | 'exclusion' | 'multiply'
  | 'hue' | 'saturation' | 'color' | 'luminosity';

/**
 * Configuration for {@link CanvasParticleEmitter}. Mirrors the Compose
 * `CanvasEmitterConfig`. All distances are in density-independent points
 * (the standard React Native unit), durations in milliseconds, angles in
 * degrees.
 *
 * Angle conventions (same as the Compose library):
 * - `spread`: 0° points up, positive values rotate clockwise.
 * - `gravityAngle`: 0° points down, 180° up, -90° right, 90° left.
 */
export interface CanvasEmitterConfig {
  /** Particles emitted per second. */
  particlePerSecond: number;
  /** Center of the emission region, in points from the canvas top-left. */
  emitterCenter: Vec2;
  /** Shape of the emission region. Default `point`. */
  startRegionShape?: EmitterRegionShape;
  /** Size of the emission region. Default {0,0}. */
  startRegionSize?: Size;
  /** Shapes to pick randomly per particle. Default `[{type:'circle'}]`. */
  particleShapes?: ParticleShape[];
  /** Particle lifetime range in ms. Default [800, 1200]. */
  lifespanRange?: Range;
  /** Duration range of the alpha 1→0 tween, starting at birth. Default = lifespanRange. */
  fadeOutTime?: Range;
  /** Duration range of the scale tween. Default = lifespanRange. */
  scaleTime?: Range;
  /** Colors to pick randomly per particle (any CSS color string). Default white. */
  colors?: string[];
  /** Sizes to pick randomly per particle. Default [{8,8}]. */
  particleSizes?: Size[];
  /** Emission angle range in degrees, 0 = up. Default [-180, 180]. */
  spread?: Range;
  /** Blend mode applied to every particle. Default 'srcOver'. */
  blendMode?: BlendModeName;
  /** Easing for the alpha tween. Must be a worklet. Default linear. */
  alphaEasing?: EasingFunction;
  /** Easing for the scale tween. Must be a worklet. Default linear. */
  scaleEasing?: EasingFunction;
  /** Initial velocity magnitude range, points/s. Default [10, 100]. */
  initialForce?: Range;
  /** Static rotation range in degrees applied per particle. Default [-180, 180]. */
  rotationRange?: Range;
  /** Scale tween start value range. Default [0, 1]. */
  startScaleRange?: Range;
  /** Scale tween end value range. Default [1, 2]. */
  targetScaleRange?: Range;
  /** Gravity magnitude in points/s². 0 = no gravity. Default 0. */
  gravityStrength?: number;
  /** Gravity direction in degrees, 0 = down. Default 0. */
  gravityAngle?: number;
  /** Boundary behavior. Default `{type:'none'}`. */
  edgeBehavior?: EdgeBehavior;
  /**
   * When true, particles whose position falls inside the start region
   * (oval/rect interiors) are skipped while drawing — physics is untouched.
   * Useful for ring emitters with 360° spread. Default false.
   */
  hideInStartRegion?: boolean;
}

/** Internal mutable per-particle state used by the UI-thread simulation. */
export interface ParticleState {
  shapeIndex: number;
  colorIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gx: number;
  gy: number;
  /** Birth timestamp in ms (frame-callback clock). */
  birth: number;
  lifespan: number;
  fadeOutDuration: number;
  scaleDuration: number;
  width: number;
  height: number;
  rotation: number;
  startScale: number;
  targetScale: number;
  scale: number;
  alpha: number;
  stuck: boolean;
}
