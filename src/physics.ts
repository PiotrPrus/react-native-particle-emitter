import type { CanvasEmitterConfig, ParticleState, Range, Vec2 } from './types';
import type { ResolvedConfig } from './resolveConfig';

const DEG = Math.PI / 180;

export function randomInRange(range: Range): number {
  'worklet';
  return range[0] + Math.random() * (range[1] - range[0]);
}

export function randomIntInRange(range: Range): number {
  'worklet';
  return Math.round(randomInRange(range));
}

/**
 * Picks a random spawn point on the outline of the start region,
 * mirroring `CanvasEmitterConfig.startPoint`.
 */
export function randomStartPoint(cfg: ResolvedConfig): Vec2 {
  'worklet';
  const cx = cfg.emitterCenter.x;
  const cy = cfg.emitterCenter.y;
  const w = cfg.startRegionSize.width;
  const h = cfg.startRegionSize.height;

  switch (cfg.startRegionShape) {
    case 'point':
      return { x: cx, y: cy };
    case 'oval': {
      const radius = Math.min(w, h) / 2;
      const angle = Math.random() * 2 * Math.PI;
      return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    }
    case 'rect': {
      // Random point on the rectangle perimeter, uniform by arc length.
      const halfW = w / 2;
      const halfH = h / 2;
      const perimeter = 2 * (w + h);
      let d = Math.random() * perimeter;
      if (d < w) return { x: cx - halfW + d, y: cy - halfH };
      d -= w;
      if (d < h) return { x: cx + halfW, y: cy - halfH + d };
      d -= h;
      if (d < w) return { x: cx + halfW - d, y: cy + halfH };
      d -= w;
      return { x: cx - halfW, y: cy + halfH - d };
    }
    case 'v-line':
      return { x: cx, y: cy - h / 2 + Math.random() * h };
    case 'h-line':
      return { x: cx - w / 2 + Math.random() * w, y: cy };
  }
}

/**
 * Returns true when `pos` falls inside the interior of the start region.
 * Only `oval` and `rect` have an interior; other shapes always return false.
 * Mirrors `CanvasEmitterConfig.isInsideStartRegion`.
 */
export function isInsideStartRegion(cfg: ResolvedConfig, x: number, y: number): boolean {
  'worklet';
  const dx = x - cfg.emitterCenter.x;
  const dy = y - cfg.emitterCenter.y;
  switch (cfg.startRegionShape) {
    case 'oval': {
      const rx = cfg.startRegionSize.width / 2;
      const ry = cfg.startRegionSize.height / 2;
      if (rx <= 0 || ry <= 0) return false;
      const nx = dx / rx;
      const ny = dy / ry;
      return nx * nx + ny * ny < 1;
    }
    case 'rect':
      return (
        Math.abs(dx) < cfg.startRegionSize.width / 2 &&
        Math.abs(dy) < cfg.startRegionSize.height / 2
      );
    default:
      return false;
  }
}

/** Creates a single particle, mirroring `createParticles` in CanvasEmitter.kt. */
export function createParticle(cfg: ResolvedConfig, now: number): ParticleState {
  'worklet';
  const gravityRad = cfg.gravityAngle * DEG;
  const gx = cfg.gravityStrength * -Math.sin(gravityRad);
  const gy = cfg.gravityStrength * Math.cos(gravityRad);

  const angle = randomInRange(cfg.spread);
  const radians = angle * DEG;
  const force = randomInRange(cfg.initialForce);
  const size = cfg.particleSizes[(Math.random() * cfg.particleSizes.length) | 0];
  const start = randomStartPoint(cfg);

  return {
    shapeIndex: (Math.random() * cfg.shapeCount) | 0,
    colorIndex: (Math.random() * cfg.colorCount) | 0,
    x: start.x,
    y: start.y,
    vx: force * Math.sin(radians),
    vy: -force * Math.cos(radians),
    gx,
    gy,
    birth: now,
    lifespan: randomIntInRange(cfg.lifespanRange),
    fadeOutDuration: randomIntInRange(cfg.fadeOutTime),
    scaleDuration: randomIntInRange(cfg.scaleTime),
    width: size.width,
    height: size.height,
    rotation: randomInRange(cfg.rotationRange),
    startScale: randomInRange(cfg.startScaleRange),
    targetScale: randomInRange(cfg.targetScaleRange),
    scale: 1,
    alpha: 1,
    stuck: false,
  };
}

/**
 * Advances the simulation by `dt` seconds, mutating `particles` in place.
 * Dead particles are removed with swap-remove. Mirrors the frame loop in
 * `CanvasParticleEmitter` (incremental v += a·dt, p += v·dt + edge behavior).
 *
 * @returns the updated particle count
 */
export function updateParticles(
  particles: ParticleState[],
  cfg: ResolvedConfig,
  now: number,
  dt: number,
  boundsW: number,
  boundsH: number
): number {
  'worklet';
  const edge = cfg.edgeBehavior;
  let i = 0;
  while (i < particles.length) {
    const p = particles[i];
    const playTime = now - p.birth;
    if (playTime > p.lifespan) {
      particles[i] = particles[particles.length - 1];
      particles.pop();
      continue;
    }

    // Tween animations: scale start→target, alpha 1→0, both from birth.
    const scaleT = Math.min(playTime / p.scaleDuration, 1);
    p.scale = p.startScale + (p.targetScale - p.startScale) * cfg.scaleEasing(scaleT);
    const alphaT = Math.min(playTime / p.fadeOutDuration, 1);
    p.alpha = 1 - cfg.alphaEasing(alphaT);

    if (!p.stuck) {
      let vx = p.vx + p.gx * dt;
      let vy = p.vy + p.gy * dt;
      let x = p.x + vx * dt;
      let y = p.y + vy * dt;

      if (boundsW > 0 && boundsH > 0 && edge.type !== 'none') {
        const halfW = p.width / 2;
        const halfH = p.height / 2;
        const minX = halfW;
        const maxX = boundsW - halfW;
        const minY = halfH;
        const maxY = boundsH - halfH;

        if (edge.type === 'bounce') {
          const damping = edge.damping ?? 0.7;
          if (x < minX) {
            x = minX + (minX - x);
            vx = -vx * damping;
          } else if (x > maxX) {
            x = maxX - (x - maxX);
            vx = -vx * damping;
          }
          if (y < minY) {
            y = minY + (minY - y);
            vy = -vy * damping;
          } else if (y > maxY) {
            y = maxY - (y - maxY);
            vy = -vy * damping;
          }
        } else if (edge.type === 'stick') {
          if (x < minX || x > maxX || y < minY || y > maxY) {
            x = Math.min(Math.max(x, minX), maxX);
            y = Math.min(Math.max(y, minY), maxY);
            vx = 0;
            vy = 0;
            p.stuck = true;
          }
        } else if (edge.type === 'wrap') {
          if (x < -halfW) x += boundsW + p.width;
          else if (x > boundsW + halfW) x -= boundsW + p.width;
          if (y < -halfH) y += boundsH + p.height;
          else if (y > boundsH + halfH) y -= boundsH + p.height;
        }
      }

      p.vx = vx;
      p.vy = vy;
      p.x = x;
      p.y = y;
    }
    i++;
  }
  return particles.length;
}
