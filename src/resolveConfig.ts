import { BlendMode, Skia } from '@shopify/react-native-skia';
import type { SkColor, SkColorFilter, SkFont, SkImage, SkPath } from '@shopify/react-native-skia';
import { linearEasing } from './easing';
import type {
  BlendModeName,
  CanvasEmitterConfig,
  EasingFunction,
  EdgeBehavior,
  EmitterRegionShape,
  Range,
  Size,
  Vec2,
} from './types';

const BLEND_MODES: Record<BlendModeName, BlendMode> = {
  clear: BlendMode.Clear,
  src: BlendMode.Src,
  dst: BlendMode.Dst,
  srcOver: BlendMode.SrcOver,
  dstOver: BlendMode.DstOver,
  srcIn: BlendMode.SrcIn,
  dstIn: BlendMode.DstIn,
  srcOut: BlendMode.SrcOut,
  dstOut: BlendMode.DstOut,
  srcATop: BlendMode.SrcATop,
  dstATop: BlendMode.DstATop,
  xor: BlendMode.Xor,
  plus: BlendMode.Plus,
  modulate: BlendMode.Modulate,
  screen: BlendMode.Screen,
  overlay: BlendMode.Overlay,
  darken: BlendMode.Darken,
  lighten: BlendMode.Lighten,
  colorDodge: BlendMode.ColorDodge,
  colorBurn: BlendMode.ColorBurn,
  hardLight: BlendMode.HardLight,
  softLight: BlendMode.SoftLight,
  difference: BlendMode.Difference,
  exclusion: BlendMode.Exclusion,
  multiply: BlendMode.Multiply,
  hue: BlendMode.Hue,
  saturation: BlendMode.Saturation,
  color: BlendMode.Color,
  luminosity: BlendMode.Luminosity,
};

/** Pre-resolved, worklet-friendly shape with everything needed to draw it. */
export type ResolvedShape =
  | { type: 'circle' }
  | { type: 'path'; path: SkPath; cx: number; cy: number }
  | { type: 'image'; image: SkImage; tint: boolean; halfW: number; halfH: number }
  | { type: 'text'; text: string; font: SkFont; halfW: number; halfH: number; baseline: number };

export interface ResolvedConfig {
  particlePerSecond: number;
  emitterCenter: Vec2;
  startRegionShape: EmitterRegionShape;
  startRegionSize: Size;
  shapes: ResolvedShape[];
  shapeCount: number;
  lifespanRange: Range;
  fadeOutTime: Range;
  scaleTime: Range;
  colors: SkColor[];
  /** Tint filter per color, used by tinted image shapes. */
  colorFilters: SkColorFilter[];
  colorCount: number;
  particleSizes: Size[];
  spread: Range;
  blendMode: BlendMode;
  alphaEasing: EasingFunction;
  scaleEasing: EasingFunction;
  initialForce: Range;
  rotationRange: Range;
  startScaleRange: Range;
  targetScaleRange: Range;
  gravityStrength: number;
  gravityAngle: number;
  edgeBehavior: EdgeBehavior;
  hideInStartRegion: boolean;
}

/**
 * Applies defaults and precomputes Skia objects (colors, tint filters, text
 * metrics, path centers) on the JS thread so the per-frame worklet only does
 * arithmetic and draw calls.
 */
export function resolveConfig(config: CanvasEmitterConfig): ResolvedConfig {
  const lifespan: Range = config.lifespanRange ?? [800, 1200];
  const colorStrings = config.colors && config.colors.length > 0 ? config.colors : ['#ffffff'];
  const colors = colorStrings.map((c) => Skia.Color(c));
  const colorFilters = colors.map((c) => Skia.ColorFilter.MakeBlend(c, BlendMode.SrcIn));

  const shapes: ResolvedShape[] = (
    config.particleShapes && config.particleShapes.length > 0
      ? config.particleShapes
      : [{ type: 'circle' } as const]
  ).map((shape): ResolvedShape => {
    switch (shape.type) {
      case 'circle':
        return { type: 'circle' };
      case 'path': {
        const bounds = shape.path.computeTightBounds();
        return {
          type: 'path',
          path: shape.path,
          cx: bounds.x + bounds.width / 2,
          cy: bounds.y + bounds.height / 2,
        };
      }
      case 'image':
        return {
          type: 'image',
          image: shape.image,
          tint: shape.tint ?? true,
          halfW: shape.image.width() / 2,
          halfH: shape.image.height() / 2,
        };
      case 'text': {
        const bounds = shape.font.measureText(shape.text);
        const metrics = shape.font.getMetrics();
        const height = -metrics.ascent + metrics.descent;
        return {
          type: 'text',
          text: shape.text,
          font: shape.font,
          halfW: bounds.width / 2,
          halfH: height / 2,
          baseline: -metrics.ascent,
        };
      }
    }
  });

  return {
    particlePerSecond: config.particlePerSecond,
    emitterCenter: config.emitterCenter,
    startRegionShape: config.startRegionShape ?? 'point',
    startRegionSize: config.startRegionSize ?? { width: 0, height: 0 },
    shapes,
    shapeCount: shapes.length,
    lifespanRange: lifespan,
    fadeOutTime: config.fadeOutTime ?? lifespan,
    scaleTime: config.scaleTime ?? lifespan,
    colors,
    colorFilters,
    colorCount: colors.length,
    particleSizes:
      config.particleSizes && config.particleSizes.length > 0
        ? config.particleSizes
        : [{ width: 8, height: 8 }],
    spread: config.spread ?? [-180, 180],
    blendMode: BLEND_MODES[config.blendMode ?? 'srcOver'],
    alphaEasing: config.alphaEasing ?? linearEasing,
    scaleEasing: config.scaleEasing ?? linearEasing,
    initialForce: config.initialForce ?? [10, 100],
    rotationRange: config.rotationRange ?? [-180, 180],
    startScaleRange: config.startScaleRange ?? [0, 1],
    targetScaleRange: config.targetScaleRange ?? [1, 2],
    gravityStrength: config.gravityStrength ?? 0,
    gravityAngle: config.gravityAngle ?? 0,
    edgeBehavior: config.edgeBehavior ?? { type: 'none' },
    hideInStartRegion: config.hideInStartRegion ?? false,
  };
}
