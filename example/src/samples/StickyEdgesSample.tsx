import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useImage } from '@shopify/react-native-skia';
import { CanvasParticleEmitter, easeOutCubic } from 'react-native-particle-emitter';
import type { CanvasEmitterConfig, EdgeBehavior } from 'react-native-particle-emitter';
import { Chip, ControlPanel, theme } from '../ui';

const BEHAVIORS: { label: string; behavior: EdgeBehavior }[] = [
  { label: 'None', behavior: { type: 'none' } },
  { label: 'Bounce', behavior: { type: 'bounce' } },
  { label: 'Stick', behavior: { type: 'stick' } },
  { label: 'Wrap', behavior: { type: 'wrap' } },
];

/**
 * Port of StickyEdgesSample.kt — long-lived particles under gravity with a
 * selectable edge behavior (none / bounce / stick / wrap).
 */
export default function StickyEdgesSample() {
  const star = useImage(require('../../assets/star_four.png'));
  const [selected, setSelected] = useState(1); // Bounce, like the original

  const config: CanvasEmitterConfig | null = useMemo(() => {
    if (!star) return null;
    return {
      particlePerSecond: 10,
      emitterCenter: { x: 200, y: 200 },
      particleShapes: [{ type: 'circle' }, { type: 'image', image: star, tint: true }],
      lifespanRange: [8000, 12000],
      colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#FF9A56'],
      scaleEasing: easeOutCubic,
      particleSizes: [
        { width: 8, height: 8 },
        { width: 12, height: 12 },
      ],
      initialForce: [80, 160],
      spread: [-45, 45],
      fadeOutTime: [7000, 11000],
      rotationRange: [-180, 180],
      scaleTime: [500, 1000],
      targetScaleRange: [0, 1],
      startScaleRange: [1, 2],
      gravityStrength: 100,
      gravityAngle: 0,
      edgeBehavior: BEHAVIORS[selected].behavior,
    };
  }, [star, selected]);

  return (
    <View style={{ flex: 1 }}>
      {config && <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />}
      <ControlPanel>
        <Text style={styles.label}>Edge behavior:</Text>
        <View style={styles.chips}>
          {BEHAVIORS.map((b, i) => (
            <Chip
              key={b.label}
              label={b.label}
              selected={selected === i}
              onPress={() => setSelected(i)}
            />
          ))}
        </View>
      </ControlPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: theme.text, fontSize: 13, marginBottom: 6 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
