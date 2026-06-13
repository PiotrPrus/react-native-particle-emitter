import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CanvasParticleEmitter } from 'react-particle-emitter';
import type { CanvasEmitterConfig } from 'react-particle-emitter';
import { ActionButton, MeasuredView, theme } from '../ui';

const MAX_EMITTERS = 10;
const PARTICLES_PER_SECOND = 1000;
const COLUMNS = 2;
const ROWS = 5;

/**
 * Port of BenchmarkSample.kt — a 2×5 grid of emitters, each pushing
 * 1000 particles/sec. Use +/- to vary the active emitter count while
 * watching the fps meter.
 */
export default function BenchmarkSample() {
  const [activeCount, setActiveCount] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {Array.from({ length: ROWS }, (_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: COLUMNS }, (_, col) => {
              const index = row * COLUMNS + col;
              return (
                <View key={col} style={styles.cell}>
                  {index < activeCount && <BenchmarkEmitter />}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.controls}>
        <ActionButton
          label="−"
          onPress={() => setActiveCount((c) => Math.max(0, c - 1))}
          disabled={activeCount === 0}
        />
        <Text style={styles.counter}>
          Active: {activeCount} / {MAX_EMITTERS}
        </Text>
        <ActionButton
          label="+"
          onPress={() => setActiveCount((c) => Math.min(MAX_EMITTERS, c + 1))}
          disabled={activeCount === MAX_EMITTERS}
        />
      </View>
    </View>
  );
}

function BenchmarkEmitter() {
  return (
    <MeasuredView>
      {({ width, height }) => {
        const config: CanvasEmitterConfig = {
          particlePerSecond: PARTICLES_PER_SECOND,
          emitterCenter: { x: width / 2, y: height / 2 },
          particleShapes: [{ type: 'circle' }],
          lifespanRange: [800, 1200],
          fadeOutTime: [400, 800],
          scaleTime: [400, 800],
          colors: ['#53FF00', '#E5FF5E', '#4AC2FF', '#FF6EC7'],
          particleSizes: [{ width: 4, height: 4 }],
          initialForce: [40, 120],
          spread: [-180, 180],
          startScaleRange: [1, 2],
          targetScaleRange: [0, 1],
        };
        return <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />;
      }}
    </MeasuredView>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  cell: { flex: 1, overflow: 'hidden' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  counter: { color: theme.text, fontSize: 15, fontWeight: '600', minWidth: 110, textAlign: 'center' },
});
