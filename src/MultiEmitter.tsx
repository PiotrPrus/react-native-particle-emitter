import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ParticlesEmitter } from './ParticlesEmitter';
import type { EmitterConfig } from './ParticlesEmitter';

export interface MultiEmitterProps {
  style?: StyleProp<ViewStyle>;
  /** Number of sequential emitters to launch. */
  emitterCount: number;
  /** Delay between consecutive emitters, ms. */
  emitterDelay: number;
  /** Shared config for every emitter. */
  emitterConfig?: EmitterConfig;
  /** Particle content; rendered once per particle. */
  children?: ReactNode;
  /** Per-particle content by index, forwarded to each emitter. */
  renderParticle?: (index: number) => ReactNode;
  /** Called when the last emitter finishes. */
  onAnimationFinished?: () => void;
}

/**
 * Orchestrates several {@link ParticlesEmitter}s launched sequentially with a
 * fixed delay — the equivalent of the Compose `MultiEmitter`.
 */
export function MultiEmitter({
  style,
  emitterCount,
  emitterDelay,
  emitterConfig,
  children,
  renderParticle,
  onAnimationFinished,
}: MultiEmitterProps) {
  const [emitters, setEmitters] = useState<number[]>([]);
  const finishedCount = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < emitterCount; i++) {
      timers.push(setTimeout(() => setEmitters((prev) => [...prev, i]), i * emitterDelay));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitterCount, emitterDelay]);

  const handleFinished = (id: number) => {
    setEmitters((prev) => prev.filter((e) => e !== id));
    finishedCount.current += 1;
    if (finishedCount.current === emitterCount) {
      onAnimationFinished?.();
    }
  };

  return (
    <View style={[{ pointerEvents: 'none' }, style]}>
      {emitters.map((id) => (
        <ParticlesEmitter
          key={id}
          style={StyleSheet.absoluteFill}
          config={emitterConfig}
          renderParticle={renderParticle}
          onAnimationFinished={() => handleFinished(id)}
        >
          {children}
        </ParticlesEmitter>
      ))}
    </View>
  );
}
