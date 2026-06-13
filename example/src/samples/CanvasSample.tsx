import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useImage } from '@shopify/react-native-skia';
import { CanvasParticleEmitter, easeOutCubic } from 'react-particle-emitter';
import type { CanvasEmitterConfig } from 'react-particle-emitter';
import { ControlPanel, LabeledSlider, MeasuredView } from '../ui';

/**
 * Port of CanvasSample.kt — star-image particles emitted from an oval
 * region around a small red avatar, with a birth-rate slider (0–1000/s).
 */
export default function CanvasSample() {
  const star = useImage(require('../../assets/star_four.png'));
  const [birthRate, setBirthRate] = useState(100);

  return (
    <MeasuredView>
      {({ width, height }) => {
        const center = { x: width / 2, y: height / 2 };
        return (
          <CanvasSampleInner
            center={center}
            birthRate={birthRate}
            setBirthRate={setBirthRate}
            star={star}
          />
        );
      }}
    </MeasuredView>
  );
}

function CanvasSampleInner({
  center,
  birthRate,
  setBirthRate,
  star,
}: {
  center: { x: number; y: number };
  birthRate: number;
  setBirthRate: (v: number) => void;
  star: ReturnType<typeof useImage>;
}) {
  const config: CanvasEmitterConfig | null = useMemo(() => {
    if (!star) return null;
    return {
      particlePerSecond: Math.round(birthRate),
      emitterCenter: center,
      startRegionShape: 'oval',
      startRegionSize: { width: 32 * 0.8, height: 32 * 0.8 },
      particleShapes: [{ type: 'image', image: star, tint: true }],
      lifespanRange: [1000, 1500],
      colors: ['#53FF00', '#E5FF5E', '#4AC2FF'],
      blendMode: 'screen',
      scaleEasing: easeOutCubic,
      particleSizes: [{ width: 8, height: 8 }],
      initialForce: [40, 100],
      spread: [-180, 180],
      fadeOutTime: [700, 1000],
      rotationRange: [0, 90],
      scaleTime: [500, 700],
      targetScaleRange: [0, 1],
      startScaleRange: [2, 3],
    };
  }, [star, birthRate, center.x, center.y]);

  return (
    <View style={{ flex: 1 }}>
      {config && <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />}
      <View
        style={[
          styles.avatar,
          { left: center.x - 16, top: center.y - 16 },
        ]}
      />
      <ControlPanel>
        <LabeledSlider
          label={`Birth rate: ${Math.round(birthRate)} particles/sec`}
          value={birthRate}
          min={0}
          max={1000}
          onChange={setBirthRate}
        />
      </ControlPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    pointerEvents: 'none' as const,
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b30',
  },
});
