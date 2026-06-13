import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Canvas, PaintStyle, Picture, Skia } from '@shopify/react-native-skia';
import type { SkCanvas } from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import type { FrameInfo } from 'react-native-reanimated';
import { resolveConfig } from './resolveConfig';
import type { ResolvedConfig } from './resolveConfig';
import { createParticle, isInsideStartRegion, updateParticles } from './physics';
import type { CanvasEmitterConfig, ParticleState } from './types';

interface EngineState {
  particles: ParticleState[];
  /** Fractional emission accumulator. */
  pending: number;
  /**
   * Monotonic simulation clock in ms, accumulated from per-frame deltas.
   *
   * We deliberately do NOT use `info.timeSinceFirstFrame`: Reanimated resets
   * it to 0 every time the frame callback is registered, and the callback is
   * re-registered on any re-render that changes its identity (e.g. editing a
   * config value via a slider). A reset would make existing particles'
   * `playTime = now - birth` go negative, which feeds a negative `t` into the
   * easing curves and spikes the scale tween to enormous values — the
   * "everything turns giant/white then shrinks back" glitch. Owning the clock
   * keeps it monotonic across re-registration.
   */
  clock: number;
}

/**
 * Delta used for the first frame after a (re)registration, when Reanimated
 * reports `timeSincePreviousFrame === null`. Advancing by a nominal frame
 * (instead of skipping) keeps the simulation moving even if the callback is
 * re-registered repeatedly mid-interaction.
 */
const NOMINAL_DT = 1 / 60;

export interface CanvasParticleEmitterProps {
  style?: StyleProp<ViewStyle>;
  config: CanvasEmitterConfig;
  /** Pauses both emission and simulation. */
  paused?: boolean;
  /**
   * Hard cap on live particles; emission is throttled when reached.
   * Default 5000.
   */
  maxParticles?: number;
}

/**
 * High-performance particle emitter rendered with native Skia.
 *
 * The simulation runs entirely on the UI thread: a Reanimated frame callback
 * integrates velocity/position each frame (v += g·dt, p += v·dt — same
 * incremental physics as the Compose `CanvasParticleEmitter`) and the result
 * is recorded into an SkPicture drawn by the Skia canvas. No per-frame React
 * renders or JS-thread work.
 */
export function CanvasParticleEmitter({
  style,
  config,
  paused = false,
  maxParticles = 5000,
}: CanvasParticleEmitterProps) {
  const resolved = useMemo(() => resolveConfig(config), [config]);

  const size = useSharedValue({ width: 0, height: 0 });
  // Engine state is created lazily ON the UI thread so the particles array is
  // a plain mutable UI-runtime object (objects assigned from the JS thread
  // are frozen by Reanimated in dev mode and cannot be mutated in place).
  const engine = useSharedValue<EngineState | null>(null);
  // Bumped once per simulation frame; the sole reactive dependency of the
  // draw below.
  const redrawTick = useSharedValue(0);

  // Latest resolved config, readable from the UI thread. Holding it in a
  // shared value (instead of capturing `resolved` directly in the frame
  // callback) lets the callback stay referentially stable, so routine config
  // edits — slider drags, toggles — no longer tear it down and re-register
  // it (which would reset the frame clock; see EngineState.clock).
  const configSV = useSharedValue<ResolvedConfig>(resolved);
  useEffect(() => {
    configSV.value = resolved;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);

  // The callback identity only changes when maxParticles changes, so it is
  // registered once for the lifetime of a given maxParticles value.
  const onFrame = useMemo(() => {
    const worklet = (info: FrameInfo) => {
      'worklet';
      const cfg = configSV.value;

      let state = engine.value;
      if (state === null) {
        state = { particles: [], pending: 0, clock: 0 };
        engine.value = state;
      }

      const previous = info.timeSincePreviousFrame;
      const dt = Math.min(
        Math.max((previous ?? NOMINAL_DT * 1000) / 1000, 0.001),
        0.1
      );
      // Monotonic clock, immune to frame-callback re-registration.
      state.clock += dt * 1000;
      const now = state.clock;
      const items = state.particles;

      // Fractional emission accumulator, like `pendingParticles` in Compose.
      state.pending += cfg.particlePerSecond * dt;
      let count = Math.floor(state.pending);
      state.pending -= count;
      count = Math.min(count, Math.max(0, maxParticles - items.length));
      for (let i = 0; i < count; i++) {
        items.push(createParticle(cfg, now));
      }

      updateParticles(items, cfg, now, dt, size.value.width, size.value.height);
      redrawTick.value = now;
    };
    return worklet;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxParticles]);

  const frameCallback = useFrameCallback(onFrame);

  useEffect(() => {
    frameCallback.setActive(!paused);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const picture = useDerivedValue(() => {
    redrawTick.value; // sole dependency: redraw once per simulation frame
    const cfg = resolved;
    const w = size.value.width || 1;
    const h = size.value.height || 1;
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, w, h));
    const state = engine.value;
    if (state !== null) {
      drawParticles(canvas, state.particles, cfg);
    }
    return recorder.finishRecordingAsPicture();
  });

  return (
    // flatten: Skia's Canvas on web rejects array styles
    <Canvas style={StyleSheet.flatten(style)} onSize={size}>
      <Picture picture={picture} />
    </Canvas>
  );
}

/** Port of `DrawScope.draw(canvasParticle)` from ParticleShapeExtensions.kt. */
function drawParticles(
  canvas: SkCanvas,
  items: ParticleState[],
  cfg: ResolvedConfig
): void {
  'worklet';
  if (items.length === 0) return;

  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setStyle(PaintStyle.Fill);
  paint.setBlendMode(cfg.blendMode);
  const hideInside = cfg.hideInStartRegion;

  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    if (p.alpha <= 0.01 || p.scale <= 0.01) continue;
    if (hideInside && isInsideStartRegion(cfg, p.x, p.y)) continue;

    // A particle born under a previous config may carry an index past the
    // current arrays (e.g. the shape/color list shrank); skip rather than
    // dereference undefined.
    const shape = cfg.shapes[p.shapeIndex];
    if (!shape) continue;

    canvas.save();
    // Scale (and rotate, for non-circles) around the particle center.
    canvas.translate(p.x, p.y);
    canvas.scale(p.scale, p.scale);
    if (shape.type !== 'circle') {
      canvas.rotate(p.rotation * p.scale, 0, 0);
    }

    switch (shape.type) {
      case 'circle': {
        paint.setColorFilter(null);
        paint.setColor(cfg.colors[p.colorIndex]);
        paint.setAlphaf(p.alpha);
        canvas.drawCircle(0, 0, p.width / 2, paint);
        break;
      }
      case 'path': {
        paint.setColorFilter(null);
        paint.setColor(cfg.colors[p.colorIndex]);
        paint.setAlphaf(p.alpha);
        canvas.translate(-shape.cx, -shape.cy);
        canvas.drawPath(shape.path, paint);
        break;
      }
      case 'image': {
        paint.setColor(Skia.Color('white'));
        paint.setAlphaf(p.alpha);
        paint.setColorFilter(shape.tint ? cfg.colorFilters[p.colorIndex] : null);
        canvas.drawImage(shape.image, -shape.halfW, -shape.halfH, paint);
        break;
      }
      case 'text': {
        paint.setColorFilter(null);
        paint.setColor(cfg.colors[p.colorIndex]);
        paint.setAlphaf(p.alpha);
        canvas.drawText(
          shape.text,
          -shape.halfW,
          -shape.halfH + shape.baseline,
          paint,
          shape.font
        );
        break;
      }
    }

    canvas.restore();
  }
}
