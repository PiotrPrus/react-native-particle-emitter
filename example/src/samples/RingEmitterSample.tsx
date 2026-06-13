import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CanvasParticleEmitter } from 'react-particle-emitter';
import type { CanvasEmitterConfig } from 'react-particle-emitter';
import { ControlPanel, MeasuredView, SwitchRow, theme } from '../ui';

const RING_DIAMETER = 180;
const COLORS = ['#FFC93C', '#FF6B6B', '#B3E0FF', '#FFFFFF'];

/**
 * Port of RingEmitterSample.kt — oval start region with 360° spread and a
 * `hideInStartRegion` toggle that keeps the ring interior clean.
 */
export default function RingEmitterSample() {
  const [hideInside, setHideInside] = useState(true);

  return (
    <MeasuredView>
      {({ width, height }) => (
        <RingInner
          center={{ x: width / 2, y: height / 2 }}
          hideInside={hideInside}
          setHideInside={setHideInside}
        />
      )}
    </MeasuredView>
  );
}

function RingInner({
  center,
  hideInside,
  setHideInside,
}: {
  center: { x: number; y: number };
  hideInside: boolean;
  setHideInside: (v: boolean) => void;
}) {
  const config: CanvasEmitterConfig = useMemo(
    () => ({
      particlePerSecond: 180,
      emitterCenter: center,
      startRegionShape: 'oval',
      startRegionSize: { width: RING_DIAMETER, height: RING_DIAMETER },
      particleShapes: [{ type: 'circle' }],
      lifespanRange: [1500, 2500],
      fadeOutTime: [1500, 2500],
      scaleTime: [1500, 2500],
      colors: COLORS,
      particleSizes: [
        { width: 4, height: 4 },
        { width: 6, height: 6 },
      ],
      spread: [0, 360],
      initialForce: [40, 90],
      startScaleRange: [1, 1],
      targetScaleRange: [1, 2],
      gravityStrength: 0,
      hideInStartRegion: hideInside,
    }),
    [center.x, center.y, hideInside]
  );

  return (
    <View style={{ flex: 1 }}>
      <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />
      <View
        style={[
          styles.ring,
          {
            left: center.x - RING_DIAMETER / 2,
            top: center.y - RING_DIAMETER / 2,
          },
        ]}
      />
      <ControlPanel>
        <SwitchRow
          label={`hideInStartRegion: ${hideInside}`}
          value={hideInside}
          onChange={setHideInside}
        />
        <Text style={styles.hint}>
          Toggle to see particles crossing the ring interior appear / disappear.
        </Text>
      </ControlPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    pointerEvents: 'none' as const,
    position: 'absolute',
    width: RING_DIAMETER,
    height: RING_DIAMETER,
    borderRadius: RING_DIAMETER / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  hint: { color: theme.textDim, fontSize: 12, marginTop: 4 },
});
