import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useImage } from '@shopify/react-native-skia';
import { CanvasParticleEmitter, easeOutCubic } from 'react-native-particle-emitter';
import type { CanvasEmitterConfig } from 'react-native-particle-emitter';
import { ControlPanel, MeasuredView, SwitchRow } from '../ui';

/**
 * Port of GravitySample.kt — fountain of circles and stars from a center
 * point, with a gravity on/off switch.
 */
export default function GravitySample() {
  const star = useImage(require('../../assets/star_four.png'));
  const [gravityEnabled, setGravityEnabled] = useState(true);

  return (
    <MeasuredView>
      {({ width, height }) => (
        <GravityInner
          center={{ x: width / 2, y: height / 2 }}
          gravityEnabled={gravityEnabled}
          setGravityEnabled={setGravityEnabled}
          star={star}
        />
      )}
    </MeasuredView>
  );
}

function GravityInner({
  center,
  gravityEnabled,
  setGravityEnabled,
  star,
}: {
  center: { x: number; y: number };
  gravityEnabled: boolean;
  setGravityEnabled: (v: boolean) => void;
  star: ReturnType<typeof useImage>;
}) {
  const config: CanvasEmitterConfig | null = useMemo(() => {
    if (!star) return null;
    return {
      particlePerSecond: 80,
      emitterCenter: center,
      particleShapes: [{ type: 'circle' }, { type: 'image', image: star, tint: true }],
      lifespanRange: [4000, 6000],
      colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1'],
      scaleEasing: easeOutCubic,
      particleSizes: [
        { width: 6, height: 6 },
        { width: 10, height: 10 },
      ],
      initialForce: [40, 120],
      spread: [-60, 60],
      fadeOutTime: [1000, 1500],
      rotationRange: [-180, 180],
      scaleTime: [500, 800],
      targetScaleRange: [0, 1],
      startScaleRange: [1, 2],
      gravityStrength: gravityEnabled ? 120 : 0,
      gravityAngle: 0,
    };
  }, [star, gravityEnabled, center.x, center.y]);

  return (
    <View style={{ flex: 1 }}>
      {config && <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />}
      <View
        style={[styles.avatar, { left: center.x - 16, top: center.y - 16 }]}
      />
      <ControlPanel>
        <SwitchRow
          label={`Gravity: ${gravityEnabled ? 'ON' : 'OFF'}`}
          value={gravityEnabled}
          onChange={setGravityEnabled}
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
    backgroundColor: '#FF6B6B',
  },
});
