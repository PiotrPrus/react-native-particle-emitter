import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DEG = Math.PI / 180;
/** Gravity baseline in points/s² (≈1 g on a ~160 dpi grid), matching the
 * `density * 386 in/s²` factor used by the Compose `SingleParticleContainer`. */
const GRAVITY = 980;

/**
 * Configuration for {@link ParticlesEmitter}. Mirrors the Compose
 * `EmitterConfig` (minus the trailing composable — pass particle content as
 * `children` or `renderParticle` instead).
 */
export interface EmitterConfig {
  /** Number of particles emitted in one run. Default 10. */
  particlesCount?: number;
  /**
   * Duration over which particles are emitted, ms. 0 emits all at once.
   * Total animation time = emitDurationMillis + particleLifespanMillis.
   */
  emitDurationMillis?: number;
  /** Lifetime of each particle in ms. Default 2000. */
  particleLifespanMillis?: number;
  /** Initial velocity magnitude, points/s. Default 100. */
  initialForce?: number;
  /** Gravity multiplier; 1 ≈ earth gravity. Default 1. */
  gravityStrength?: number;
  /** Gravity direction in degrees, 0 = down, 180 = up. Default 0. */
  gravityAngle?: number;
  /** Launch angle range in degrees, 0 = up. Default [-180, 180]. */
  spread?: [number, number];
  /** Max horizontal travel from the start point, points. 0 = unlimited. Default 0. */
  maxHorizontalDisplacement?: number;
  /** Full rotations over a particle's lifetime. Default 1. */
  rotationMultiplier?: number;
  /** Spawn each run at a random point instead of the center. Default true. */
  randomStartPoint?: boolean;
}

export interface ParticlesEmitterProps {
  style?: StyleProp<ViewStyle>;
  config?: EmitterConfig;
  /** Particle content; rendered once per particle. */
  children?: ReactNode;
  /** Alternative to children: per-particle content by index. */
  renderParticle?: (index: number) => ReactNode;
  /** Called when the last emitted particle's lifetime ends. */
  onAnimationFinished?: () => void;
}

interface SpawnedParticle {
  id: number;
  angle: number;
}

/**
 * Emits arbitrary React elements as particles following ballistic
 * trajectories (p = p₀ + v·t + ½·g·t²), the same closed-form kinematics as
 * the Compose `ParticlesEmitter`. For large particle counts prefer
 * `CanvasParticleEmitter`.
 */
export function ParticlesEmitter({
  style,
  config = {},
  children,
  renderParticle,
  onAnimationFinished,
}: ParticlesEmitterProps) {
  const {
    particlesCount = 10,
    emitDurationMillis = 0,
    spread = [-180, 180],
    randomStartPoint = true,
  } = config;

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<SpawnedParticle[]>([]);
  const finishedCount = useRef(0);
  const startedRef = useRef(false);

  const startPoint = useMemo(() => {
    if (layout.width === 0 || layout.height === 0) return null;
    return randomStartPoint
      ? { x: Math.random() * layout.width, y: Math.random() * layout.height }
      : { x: layout.width / 2, y: layout.height / 2 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, randomStartPoint]);

  useEffect(() => {
    if (!startPoint || startedRef.current) return;
    startedRef.current = true;

    const makeParticle = (id: number): SpawnedParticle => ({
      id,
      angle: spread[0] + Math.random() * (spread[1] - spread[0]),
    });

    if (emitDurationMillis === 0) {
      setParticles(Array.from({ length: particlesCount }, (_, i) => makeParticle(i)));
      return;
    }

    const interval = emitDurationMillis / particlesCount;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < particlesCount; i++) {
      timers.push(
        setTimeout(() => setParticles((prev) => [...prev, makeParticle(i)]), i * interval)
      );
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPoint]);

  const handleParticleEnd = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
    finishedCount.current += 1;
    if (finishedCount.current === particlesCount) {
      onAnimationFinished?.();
    }
  };

  return (
    // No overflow clipping: like the Compose emitter, particles may travel
    // beyond the emitter's own bounds.
    <View
      style={[{ pointerEvents: 'none' }, style]}
      onLayout={(e: LayoutChangeEvent) => setLayout(e.nativeEvent.layout)}
    >
      {startPoint &&
        particles.map((p) => (
          <SingleParticle
            key={p.id}
            angle={p.angle}
            config={config}
            startX={startPoint.x}
            startY={startPoint.y}
            onLifeEnded={() => handleParticleEnd(p.id)}
          >
            {renderParticle ? renderParticle(p.id) : children}
          </SingleParticle>
        ))}
    </View>
  );
}

interface SingleParticleProps {
  angle: number;
  config: EmitterConfig;
  startX: number;
  startY: number;
  onLifeEnded: () => void;
  children?: ReactNode;
}

function SingleParticle({
  angle,
  config,
  startX,
  startY,
  onLifeEnded,
  children,
}: SingleParticleProps) {
  const {
    particleLifespanMillis = 2000,
    initialForce = 100,
    gravityStrength = 1,
    gravityAngle = 0,
    maxHorizontalDisplacement = 0,
    rotationMultiplier = 1,
  } = config;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: particleLifespanMillis, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(onLifeEnded)();
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const radians = angle * DEG;
  const gravityRadians = gravityAngle * DEG;
  const gravityAccelX = GRAVITY * gravityStrength * -Math.sin(gravityRadians);
  const gravityAccelY = GRAVITY * gravityStrength * Math.cos(gravityRadians);
  const lifespanSeconds = particleLifespanMillis / 1000;

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value * lifespanSeconds;
    let x = startX + initialForce * Math.sin(radians) * t + 0.5 * gravityAccelX * t * t;
    if (maxHorizontalDisplacement > 0) {
      x = Math.min(
        Math.max(x, startX - maxHorizontalDisplacement),
        startX + maxHorizontalDisplacement
      );
    }
    const y = startY - initialForce * Math.cos(radians) * t + 0.5 * gravityAccelY * t * t;
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotateZ: `${360 * rotationMultiplier * progress.value}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
